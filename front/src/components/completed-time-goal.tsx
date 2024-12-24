import { format } from 'date-fns'
import { Badge } from './ui/badge'

type CompletedTimeGoalProps = {
  startDate: Date
  goalCreatedAt: string
  completedAt: string
  daysToComplete: number
  totalHours: number
}

export function CompletedTimeGoal({ 
  startDate, 
  goalCreatedAt, 
  completedAt, 
  daysToComplete, 
  totalHours 
}: CompletedTimeGoalProps) {
  return (
    <div className="flex flex-col gap-1">
      <span>
        First timer: {format(startDate, 'PPP')}<br></br>
        {startDate.getTime() !== new Date(goalCreatedAt).getTime() && (
          <span>Goal created: {format(new Date(goalCreatedAt), 'PPP')}</span>
        )}
      </span>
      <p>Completed on {format(new Date(completedAt), 'PPP')}</p>
      <p className="flex items-center gap-2">
        <span>Duration: {daysToComplete} days</span>
        <span>•</span>
        <span>Total: {totalHours.toFixed(1)} hours</span>
      </p>
    </div>
  )
} 