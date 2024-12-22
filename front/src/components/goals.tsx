import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Goal, GoalPriority, GoalProgress } from '@/types'
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
import { Plus, Target, Tag, CheckCircle } from 'lucide-react'
import { Label } from './ui/label'
import { format } from 'date-fns'
import { differenceInDays } from 'date-fns'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils'

export function Goals() {
  const [goals, setGoals] = React.useState<Goal[]>([])
  const [progress, setProgress] = React.useState<Record<string, GoalProgress>>({})
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const { allTimers } = useTimerStore()
  
  // Form state
  const [newGoal, setNewGoal] = React.useState({
    title: '',
    description: '',
    targetHours: 0,
    priority: 'MEDIUM' as GoalPriority,
    tags: [] as string[],
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
      const response = await fetch(API.getUrl('GOALS'), {
        credentials: 'include'
      });
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    }
  };

  const isGoalCompleted = (goalId: string) => {
    return progress[goalId]?.percentageComplete >= 100;
  };

  const getCompletionDetails = (goal: Goal) => {
    const goalProgress = progress[goal.id];
    if (!goalProgress || !isGoalCompleted(goal.id)) return null;

    const daysToComplete = differenceInDays(
      new Date(goal.completed_at || new Date()),
      new Date(goal.created_at)
    );

    return {
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

      const percentageComplete = Math.min((totalHours / goal.target_hours) * 100, 100);
      
      if (percentageComplete >= 100 && !goal.completed_at) {
        updateGoalCompletion(goal.id);
      }

      progressData[goal.id] = {
        goalId: goal.id,
        currentHours: totalHours,
        percentageComplete,
        remainingHours: Math.max(goal.target_hours - totalHours, 0)
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

  const addGoal = async () => {
    try {
      const response = await fetch(API.getUrl('GOALS'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newGoal.title,
          description: newGoal.description,
          targetHours: newGoal.targetHours,
          priority: newGoal.priority,
          tags: newGoal.tags
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create goal');
      }

      const data = await response.json();
      setGoals(prev => [...prev, data]);
      setIsDialogOpen(false);
      setNewGoal({
        title: '',
        description: '',
        targetHours: 0,
        priority: 'MEDIUM',
        tags: [],
      });
    } catch (error) {
      console.error('Failed to add goal:', error);
    }
  };

  const getPriorityColor = (priority: GoalPriority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Goals</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label>Target Hours</Label>
                <Input
                  type="number"
                  value={newGoal.targetHours}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetHours: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
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
              <div>
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
              <Button 
                className="w-full" 
                onClick={addGoal}
                disabled={!newGoal.title || !newGoal.targetHours || newGoal.tags.length === 0}
              >
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {goals.map(goal => {
          const completionDetails = getCompletionDetails(goal);
          
          return (
            <Card 
              key={goal.id}
              className={cn(
                "transition-all duration-200",
                completionDetails && "bg-muted/50"
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {completionDetails ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Target className="h-5 w-5" />
                      )}
                      <span className={cn(
                        completionDetails && "text-muted-foreground"
                      )}>
                        {goal.title}
                      </span>
                    </CardTitle>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>Started {format(new Date(goal.created_at), 'PPP')}</span>
                        {completionDetails && (
                          <Badge variant="outline" className="text-green-500">
                            Completed
                          </Badge>
                        )}
                      </div>
                      {completionDetails && (
                        <div className="space-y-1 mt-1 p-2 rounded-md bg-background">
                          <p>Completed on {format(new Date(goal.completed_at!), 'PPP')}</p>
                          <p className="flex items-center gap-2">
                            <span>Duration: {completionDetails.daysToComplete} days</span>
                            <span>•</span>
                            <span>Total: {completionDetails.totalHours.toFixed(1)} hours</span>
                          </p>
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
                          <Button variant="outline" size="sm">
                            Complete Goal
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Complete Goal Early?</AlertDialogTitle>
                            <AlertDialogDescription>
                              <div className="space-y-2">
                                <p>
                                  This goal is at {Math.round(progress[goal.id]?.percentageComplete || 0)}% completion.
                                </p>
                                <Progress 
                                  value={progress[goal.id]?.percentageComplete || 0}
                                  className="h-2"
                                />
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
                        getPriorityColor(goal.priority),
                        "text-white",
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
                            "flex items-center gap-1",
                            completionDetails && "opacity-75"
                          )}
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
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
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  )
} 