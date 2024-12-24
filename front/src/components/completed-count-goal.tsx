import { format } from 'date-fns'
import { Badge } from './ui/badge'

type CompletedCountGoalProps = {
  createdAt: string
  completedAt: string
  daysToComplete: number
  currentCount: number
  targetCount: number
}

export function CompletedCountGoal({
  createdAt,
  completedAt,
  daysToComplete,
  currentCount,
  targetCount
}: CompletedCountGoalProps) {
  return (
    <div className="flex flex-col gap-1">
      <span>Started: {format(new Date(createdAt), 'PPP')}</span>
      <span>Completed: {format(new Date(completedAt), 'PPP')}</span>
      <div className="flex items-center gap-2 mt-1">
        <span>Duration: {daysToComplete} days</span>
        <span>•</span>
        <span>Final Count: {currentCount}</span>
        {currentCount > targetCount && (
          <Badge variant="secondary" className="ml-2">
            +{currentCount - targetCount} over target
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Average: {(currentCount / (daysToComplete || 1)).toFixed(1)} per day
      </p>
    </div>
  )
} 