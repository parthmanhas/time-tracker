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
                updateGoalCompletion(goal.id);
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
            <div className="container mx-auto p-8 space-y-8 max-w-7xl">
                <div className="flex justify-between items-center bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 p-6 rounded-lg shadow-sm border border-red-200/50 dark:border-red-800/50">
                    <div className="space-y-1">
                        <WithSidebarTrigger>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent dark:from-red-400 dark:to-red-300">Goals</h1>
                        </WithSidebarTrigger>
                        <p className="text-muted-foreground">Track your progress and achievements</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all dark:bg-red-700 dark:hover:bg-red-600">
                                <Plus className="mr-2 h-5 w-5" /> New Goal
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
                {/* goals display */}
                <div className="grid gap-6">
                    {goals?.map(goal => {
                        const completionDetails = getCompletionDetails(goal);
                        const startDate = getGoalStartDate(goal);
                        return (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card
                                    key={goal.id}
                                    className={cn(
                                        "transition-all duration-300 hover:shadow-lg border-teal-200/50 dark:border-teal-800/50",
                                        completionDetails && "bg-muted/50"
                                    )}
                                >
                                    <CardHeader className="space-y-4">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="flex items-center gap-2 text-xl">
                                                    {completionDetails ? (
                                                        <CheckCircle className="h-5 w-5 text-teal-500" />
                                                    ) : (
                                                        <Target className="h-5 w-5 text-teal-500" />
                                                    )}
                                                    <span className={cn(
                                                        "tracking-tight",
                                                        completionDetails && "text-muted-foreground"
                                                    )}>
                                                        {goal.title}
                                                    </span>
                                                </CardTitle>
                                                <div className="flex flex-col gap-1 text-sm text-muted-foreground">

                                                    {completionDetails && (
                                                        <div className="space-y-1 mt-1 p-2 rounded-md bg-background">
                                                            {goal.type === 'TIME' ? (
                                                                <CompletedTimeGoal
                                                                    startDate={startDate}
                                                                    goalCreatedAt={goal.created_at}
                                                                    completedAt={goal.completed_at!}
                                                                    daysToComplete={completionDetails.daysToComplete}
                                                                    totalHours={completionDetails.totalHours}
                                                                />
                                                            ) : (
                                                                <CompletedCountGoal
                                                                    createdAt={goal.created_at}
                                                                    completedAt={goal.completed_at!}
                                                                    daysToComplete={completionDetails.daysToComplete}
                                                                    currentCount={goal.current_count!}
                                                                    targetCount={goal.target_count!}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {goal.description && (
                                                    <p className={cn(
                                                        "text-sm mt-2",
                                                        completionDetails ? "text-muted-foreground" : "text-foreground"
                                                    )}>
                                                        {goal.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!completionDetails && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                className="border-teal-200 hover:border-teal-300 dark:border-teal-800 dark:hover:border-teal-700"
                                                            >
                                                                Complete Goal
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Complete Goal Early?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    <div className="space-y-2">
                                                                        {goal.type === 'TIME' ? (
                                                                            <>
                                                                                <p>
                                                                                    This goal is at {Math.round(progress[goal.id]?.percentageComplete || 0)}% completion.
                                                                                </p>
                                                                                <Progress
                                                                                    value={progress[goal.id]?.percentageComplete || 0}
                                                                                    className="h-2"
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <p>
                                                                                    Current progress: {goal.current_count} out of {goal.target_count} {goal.target_count === 1 ? 'count' : 'counts'}
                                                                                </p>
                                                                                <Progress
                                                                                    value={((goal.current_count || 0) / (goal.target_count || 1)) * 100}
                                                                                    className="h-2"
                                                                                />
                                                                            </>
                                                                        )}
                                                                        <p className="text-sm mt-4">
                                                                            Are you sure you want to mark it as complete? This action cannot be undone.
                                                                        </p>
                                                                    </div>
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleCompleteGoal(goal.id)}
                                                                >
                                                                    Complete Goal
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                                <Badge
                                                    className={cn(
                                                        "text-white transition-all",
                                                        getPriorityColor(goal.priority),
                                                        completionDetails && "opacity-75"
                                                    )}
                                                >
                                                    {goal.priority}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {goal.tags && goal.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {goal.tags.map(tag => (
                                                        <Badge
                                                            key={tag}
                                                            variant={completionDetails ? "outline" : "secondary"}
                                                            className={cn(
                                                                "flex items-center gap-1 bg-teal-100 text-teal-900 dark:bg-teal-900 dark:text-teal-100",
                                                                completionDetails && "opacity-75"
                                                            )}
                                                        >
                                                            <Tag className="h-3 w-3" />
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            {goal.type === 'TIME' ? (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Progress</span>
                                                        <span>
                                                            {Math.round(progress[goal.id]?.currentHours || 0)}h / {goal.target_hours}h
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={progress[goal.id]?.percentageComplete || 0}
                                                        className={cn(
                                                            completionDetails && "opacity-75"
                                                        )}
                                                    />
                                                    {!completionDetails && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {progress[goal.id]?.remainingHours.toFixed(1)}h remaining
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span>Progress</span>
                                                        <div className="flex items-center gap-2">
                                                            {!completionDetails && (
                                                                <>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        onClick={() => handleCountUpdate(goal.id, -1)}
                                                                    >
                                                                        <MinusCircle className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        onClick={() => handleCountUpdate(goal.id, 1)}
                                                                    >
                                                                        <PlusCircle className="h-4 w-4" />
                                                                    </Button>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="outline" size="sm">
                                                                                Add Multiple
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
                                                                </>
                                                            )}
                                                            <span className="min-w-[80px] text-right">
                                                                {goal.current_count || 0} / {goal.target_count}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Progress
                                                        value={((goal.current_count || 0) / (goal.target_count || 1)) * 100}
                                                        className={cn(
                                                            completionDetails && "opacity-75"
                                                        )}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </WithLoading>
    )
}