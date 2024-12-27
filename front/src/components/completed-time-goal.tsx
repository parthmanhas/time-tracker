import { format } from 'date-fns'
import { CalendarDays, Clock, Trophy, Target, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
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
    <div className={cn(
      "bg-gradient-to-br from-white to-slate-50",
      "p-6 rounded-xl border shadow-sm",
      "hover:shadow-md transition-all duration-200"
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Trophy className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Goal Completed!</h3>
          <p className="text-sm text-slate-500">Time tracking milestone achieved</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Timeline Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Timeline</span>
          </div>
          <div className="space-y-2 pl-2 border-l-2 border-blue-100">
            <div className="relative">
              <div className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-blue-200" />
              <p className="text-xs text-slate-600 pl-4">
                Started: {format(startDate, 'PPP')}
              </p>
            </div>
            {startDate.getTime() !== new Date(goalCreatedAt).getTime() && (
              <div className="relative">
                <div className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-purple-200" />
                <p className="text-xs text-slate-600 pl-4">
                  Goal Set: {format(new Date(goalCreatedAt), 'PPP')}
                </p>
              </div>
            )}
            <div className="relative">
              <div className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-green-200" />
              <p className="text-xs text-slate-600 pl-4">
                Completed: {format(new Date(completedAt), 'PPP')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Target className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Achievement</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-slate-50">
                {daysToComplete} days
              </Badge>
              <Badge variant="outline" className="bg-slate-50">
                {totalHours.toFixed(1)} hours
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Completed in {daysToComplete} days with a total of {totalHours.toFixed(1)} hours tracked
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}