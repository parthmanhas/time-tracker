import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Goal, GoalPriority, GoalProgress, GoalType } from '@/types'
import { API } from '@/config/api'
import { useTimerStore } from '@/store/useTimerStore'
import { Progress } from "@/components/ui/progress"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Target, Tag, CheckCircle, PlusCircle, MinusCircle } from 'lucide-react'
import { Label } from './ui/label'
import { differenceInDays } from 'date-fns'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { cn, fetchAllTimers } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { WithLoading } from '@/hoc/hoc'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CompletedTimeGoal } from './completed-time-goal'
import { CompletedCountGoal } from './completed-count-goal'
import { WithSidebarTrigger } from './with-sidebar-trigger'
import { useAuth } from '@/context/auth-context'
import { motion } from 'framer-motion'

export function Goals() {
    const [goals, setGoals] = React.useState<Goal[]>([])
    const [progress, setProgress] = React.useState<Record<string, GoalProgress>>({})
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const { allTimers, setAllTimers } = useTimerStore()
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const { logout } = useAuth();

    React.useEffect(() => {
        fetchAllTimers(setAllTimers, logout, setIsLoading);
    }, [])

    // Form state
    const [newGoal, setNewGoal] = React.useState({
        title: '',
        description: '',
        type: 'TIME' as GoalType,
        priority: 'MEDIUM' as GoalPriority,
        tags: [] as string[],
        is_active: true,
        target_count: 0,
        target_hours: 0,
        current_count: 0,
    })

    const uniqueTags = React.useMemo(() => {
        const tags = new Set<string>()
        allTimers.forEach(timer => {
            timer.tags?.forEach(tag => tags.add(tag))
        })
        return Array.from(tags)
    }, [allTimers])

    const fetchGoals = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(API.getUrl('GOALS'), {
                credentials: 'include'
            });
            const data = await response.json();
            setGoals(data);
        } catch (error) {
            console.error('Failed to fetch goals:', error);
        } finally {
            setIsLoading(false);
        }

    };

    const isGoalCompleted = (goalId: string) => {
        return progress[goalId]?.percentageComplete >= 100;
    };

    const getGoalStartDate = (goal: Goal) => {
        let earliestDate: Date | null = null;

        allTimers.forEach(timer => {
            if (!timer.completedAt || !timer.tags) return;

            const hasMatchingTag = timer.tags.some(tag => goal?.tags?.includes(tag));
            if (hasMatchingTag) {
                const timerDate = new Date(timer.createdAt);
                if (!earliestDate || timerDate < earliestDate) {
                    earliestDate = timerDate;
                }
            }
        });

        return earliestDate || new Date(goal.created_at);
    };

    const getCompletionDetails = (goal: Goal) => {
        const goalProgress = progress[goal.id];
        if (!goalProgress || !isGoalCompleted(goal.id)) return null;

        const startDate = getGoalStartDate(goal);
        const daysToComplete = differenceInDays(
            new Date(goal.completed_at || new Date()),
            startDate
        );

        return {
            startDate,
            daysToComplete,
            totalHours: goalProgress.currentHours
        };
    };

    const calculateProgress = () => {
        const progressData: Record<string, GoalProgress> = {};

        goals.forEach(goal => {
            let totalHours = 0;

            allTimers.forEach(timer => {
                if (!timer.completedAt || !timer.tags) return;

                const hasMatchingTag = timer.tags.some(tag => goal?.tags?.includes(tag));
                if (hasMatchingTag) {
                    totalHours += parseFloat((timer.duration / 3600).toFixed(2));
                }
            });

            const percentageComplete = Math.min((totalHours / (goal.target_hours || 0)) * 100, 100);

            if (percentageComplete >= 100 && !goal.completed_at) {
                // updateGoalCompletion(goal.id);
            }

            progressData[goal.id] = {
                goalId: goal.id,
                currentHours: totalHours,
                percentageComplete: goal.completed_at ? 100 : percentageComplete,
                remainingHours: Math.max((goal.target_hours || 0) - totalHours, 0)
            };
        });

        setProgress(progressData);
    };

    const updateGoalCompletion = async (goalId: string) => {
        try {
            const response = await fetch(`${API.getUrl('GOALS')}/${goalId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    completed_at: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update goal completion');
            }

            const updatedGoal = await response.json();
            setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
        } catch (error) {
            console.error('Failed to update goal completion:', error);
        }
    };

    const handleCompleteGoal = async (goalId: string) => {
        try {
            const response = await fetch(`${API.getUrl('GOALS')}/${goalId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    completed_at: new Date().toISOString(),
                    is_active: false
                })
            });

            if (!response.ok) {
                throw new Error('Failed to complete goal');
            }

            const updatedGoal = await response.json();
            setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
        } catch (error) {
            console.error('Failed to complete goal:', error);
        }
    };

    const quickIncrements = [
        { label: '+10', value: 10 },
        { label: '+20', value: 20 },
        { label: '+50', value: 50 },
    ];

    const handleCountUpdate = async (goalId: string, increment: number) => {
        try {
            setIsLoading(true);
            const goal = goals.find(g => g.id === goalId);
            if (!goal) return;

            const newCount = (goal.current_count || 0) + increment;
            if (newCount < 0) return;

            const response = await fetch(`${API.getUrl('GOALS')}/${goalId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_count: newCount,
                    completed_at: newCount >= (goal.target_count || 0) ? new Date().toISOString() : null
                })
            });

            if (!response.ok) throw new Error('Failed to update count');

            const updatedGoal = await response.json();
            setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
        } catch (error) {
            console.error('Failed to update count:', error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchGoals();
    }, []);

    React.useEffect(() => {
        calculateProgress();
    }, [goals, allTimers]);

    const handleTagToggle = (tag: string) => {
        setNewGoal(prev => ({
            ...prev,
            tags: prev?.tags?.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const addGoal = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (newGoal.type === 'TIME' && newGoal.target_hours <= 0) {
            setError('Target hours must be greater than 0');
            return;
        }
        if (newGoal.type === 'COUNT' && newGoal.target_count <= 0) {
            setError('Target count must be greater than 0');
            return;
        }
        if (newGoal.tags.length === 0) {
            setError('Please select at least one tag');
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(API.getUrl('GOALS'), {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: newGoal.title,
                    description: newGoal.description,
                    target_hours: newGoal.target_hours,
                    target_count: newGoal.target_count,
                    current_count: newGoal.current_count,
                    priority: newGoal.priority,
                    tags: newGoal.tags,
                    type: newGoal.type
                })
            });

            // show a toast if already a high priority goal
            if (response.status === 400) {
                toast({
                    title: 'You already have a high priority goal',
                    variant: 'destructive',
                });
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to create goal');
            }

            const data = await response.json();
            setGoals(prev => [...prev, data]);
            setIsDialogOpen(false);
            setNewGoal({
                title: '',
                description: '',
                type: 'TIME' as GoalType,
                priority: 'MEDIUM' as GoalPriority,
                tags: [] as string[],
                is_active: true,
                target_count: 0,
                target_hours: 0,
                current_count: 0,
            });
        } catch (error) {
            console.error('Failed to add goal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        setGoals(goals.sort((a, b) => (b.priority === 'HIGH' ? 1 : 0) - (a.priority === 'HIGH' ? 1 : 0) || (b.completed_at ? 0 : 1) - (a.completed_at ? 0 : 1) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }, [goals]);

    const getPriorityColor = (priority: GoalPriority) => {
        switch (priority) {
            case 'HIGH': return 'bg-gradient-to-r from-red-500 to-red-600';
            case 'MEDIUM': return 'bg-gradient-to-r from-amber-500 to-amber-600';
            case 'LOW': return 'bg-gradient-to-r from-teal-500 to-teal-600';
            default: return 'bg-gradient-to-r from-slate-500 to-slate-600';
        }
    };

    return (
        <WithLoading isLoading={isLoading} isScreen={true}>
            <div className="container mx-auto p-4 sm:p-8 space-y-6">
                {/* Header Section - More compact and prominent */}
                <div className="flex flex-col sm:flex-row gap-4 items-center bg-gradient-to-r from-red-50/80 to-red-100/80 dark:from-red-950/40 dark:to-red-900/40 p-4 sm:p-6 rounded-xl shadow-lg border border-red-200/50 dark:border-red-800/50 backdrop-blur-sm">
                    <div className="flex-1 space-y-1 text-center sm:text-left">
                        <WithSidebarTrigger>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent dark:from-red-400 dark:to-red-300">
                                Goals
                            </h1>
                        </WithSidebarTrigger>
                        <p className="text-sm text-muted-foreground">Set targets, track progress, achieve more</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="lg"
                                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-md hover:shadow-lg transition-all dark:from-red-700 dark:to-red-600"
                            >
                                <Plus className="mr-2 h-5 w-5" /> Create Goal
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Goal</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={addGoal} className="space-y-4">
                                <div className='flex flex-col gap-2'>
                                    <Label>Title</Label>
                                    <Input
                                        required
                                        value={newGoal.title}
                                        onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                                    />
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label>Description</Label>
                                    <Textarea
                                        value={newGoal.description}
                                        onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label>Type</Label>
                                    <Select
                                        required
                                        value={newGoal.type}
                                        onValueChange={(value: GoalType) => setNewGoal(prev => ({
                                            ...prev,
                                            type: value
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TIME">Time-based</SelectItem>
                                            <SelectItem value="COUNT">Count-based</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {newGoal.type === 'TIME' ? (
                                    <div className='flex flex-col gap-2'>
                                        <Label>Target Hours</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            required
                                            value={newGoal.target_hours}
                                            onChange={(e) => setNewGoal(prev => ({
                                                ...prev,
                                                target_hours: parseFloat(e.target.value)
                                            }))}
                                        />
                                    </div>
                                ) : (
                                    <div className='flex flex-col gap-2'>
                                        <Label>Target Count</Label>
                                        <Input
                                            required
                                            type="number"
                                            min={0}
                                            value={newGoal.target_count}
                                            onChange={(e) => setNewGoal(prev => ({
                                                ...prev,
                                                target_count: parseInt(e.target.value)
                                            }))}
                                        />
                                    </div>
                                )}
                                <div className='flex flex-col gap-2'>
                                    <Label>Priority</Label>
                                    <Select
                                        value={newGoal.priority}
                                        onValueChange={(value: GoalPriority) =>
                                            setNewGoal(prev => ({ ...prev, priority: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="LOW">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label>Tags</Label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {uniqueTags.map(tag => (
                                            <Badge
                                                key={tag}
                                                variant={newGoal.tags.includes(tag) ? "default" : "outline"}
                                                className="cursor-pointer"
                                                onClick={() => handleTagToggle(tag)}
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                        {newGoal.tags
                                            .filter(tag => !uniqueTags.includes(tag))
                                            .map(tag => (
                                                <Badge
                                                    key={tag}
                                                    variant="default"
                                                    className="cursor-pointer"
                                                    onClick={() => handleTagToggle(tag)}
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                    </div>
                                </div>
                                <p className='text-red-500'>{error}</p>
                                <WithLoading isLoading={isLoading} isScreen={false}>
                                    <Button
                                        type='submit'
                                        className="w-full"                                    >
                                        Create Goal
                                    </Button>
                                </WithLoading>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Goals Grid - More compact layout */}
                <div className="grid gap-4">
                    {/* Active Goals Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Target className="h-5 w-5 text-red-500" />
                            <h2 className="text-lg font-semibold">Active Goals</h2>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {goals?.filter(goal => !goal.completed_at).map(goal => (
                                <motion.div
                                    key={goal.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="group hover:shadow-lg transition-all duration-300 border-red-100 dark:border-red-900/50">
                                        <CardHeader className="p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <h3 className="font-semibold tracking-tight group-hover:text-red-600 transition-colors">
                                                            {goal.title}
                                                        </h3>
                                                        {goal.description && (
                                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                                {goal.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Badge className={cn(
                                                        "text-white text-xs shrink-0",
                                                        getPriorityColor(goal.priority)
                                                    )}>
                                                        {goal.priority}
                                                    </Badge>
                                                </div>

                                                {/* Compact Progress Section */}
                                                {goal.type === 'TIME' ? (
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">Progress</span>
                                                            <span className="font-medium">
                                                                {Math.round(progress[goal.id]?.currentHours || 0)}/{goal.target_hours}h
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={progress[goal.id]?.percentageComplete || 0}
                                                            className="h-2"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    onClick={() => handleCountUpdate(goal.id, -1)}
                                                                >
                                                                    <MinusCircle className="h-4 w-4" />
                                                                </Button>
                                                                <span className="text-sm font-medium w-16 text-center">
                                                                    {goal.current_count || 0} / {goal.target_count}
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    onClick={() => handleCountUpdate(goal.id, 1)}
                                                                >
                                                                    <PlusCircle className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="outline" size="sm" className="h-7">
                                                                        Add
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent>
                                                                    {quickIncrements.map(({ label, value }) => (
                                                                        <DropdownMenuItem
                                                                            key={value}
                                                                            onClick={() => handleCountUpdate(goal.id, value)}
                                                                        >
                                                                            {label}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                        <Progress
                                                            value={((goal.current_count || 0) / (goal.target_count || 1)) * 100}
                                                            className="h-2"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>

                                        {/* Compact Tags Section */}
                                        {goal.tags && goal.tags.length > 0 && (
                                            <CardContent className="pt-0 px-4 pb-4 flex justify-between">
                                                <div className="flex flex-wrap gap-1">
                                                    {goal.tags.map(tag => (
                                                        <Badge
                                                            key={tag}
                                                            variant="secondary"
                                                            className="text-xs bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                                                        >
                                                            <Tag className="h-3 w-3 mr-1 opacity-50" />
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <Button onClick={() => handleCompleteGoal(goal.id)} size="sm" variant="outline">Complete</Button>
                                            </CardContent>
                                        )}
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Completed Goals Section - Similar compact style */}
                    <div className="space-y-4 mt-8">
                        <div className="flex items-center gap-2 px-1">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <h2 className="text-lg font-semibold">Completed Goals</h2>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {goals?.filter(goal => goal.completed_at).map(goal => {
                                const completionDetails = getCompletionDetails(goal);
                                return (
                                    <motion.div
                                        key={goal.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* Use CompletedCountGoal or CompletedTimeGoal directly in a card */}
                                        <Card className="overflow-hidden">
                                            {goal.type === 'TIME' ? (
                                                <CompletedTimeGoal 
                                                    completedAt={goal.completed_at!}
                                                    goalCreatedAt={goal.created_at}
                                                    daysToComplete={100}
                                                    totalHours={completionDetails?.totalHours || 0}
                                                    startDate={new Date(completionDetails!.startDate)}
                                                />
                                            ) : (
                                                <CompletedCountGoal
                                                    createdAt={goal.created_at}
                                                    completedAt={goal.completed_at!}
                                                    daysToComplete={completionDetails?.daysToComplete || 0}
                                                    currentCount={goal.current_count!}
                                                    targetCount={goal.target_count!}
                                                />
                                            )}
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </WithLoading>
    );
}