import { format } from 'date-fns'
import { Badge } from './ui/badge'
import { Calendar, Target, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const progressPercentage = (currentCount / targetCount) * 100;
  const averagePerDay = (currentCount / (daysToComplete || 1));

  return (
    <div className={cn(
      "bg-gradient-to-br from-white to-slate-50",
      "p-6 rounded-xl border shadow-sm",
      "hover:shadow-md transition-all duration-200"
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <Target className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Count Goal Achievement</h3>
          <p className="text-sm text-slate-500">Target: {targetCount} items</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Timeline */}
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
                Started: {format(new Date(createdAt), 'PPP')}
              </p>
            </div>
            <div className="relative">
              <div className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-green-200" />
              <p className="text-xs text-slate-600 pl-4">
                Completed: {format(new Date(completedAt), 'PPP')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Progress</span>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-slate-50">
                {daysToComplete} days
              </Badge>
              <Badge variant="outline" className="bg-slate-50">
                {currentCount} completed
              </Badge>
              {currentCount > targetCount && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                  +{currentCount - targetCount} extra
                </Badge>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progressPercentage >= 100 ? "bg-green-500" : "bg-blue-500"
                )}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="p-1 bg-amber-100 rounded">
                <p className="font-medium text-amber-700">
                  {averagePerDay.toFixed(1)} per day
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}