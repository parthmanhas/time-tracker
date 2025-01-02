import { format } from 'date-fns'
import { Badge } from './ui/badge'
import { Calendar, Flag, Medal, Target, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

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
  const extraCount = currentCount - targetCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
        "p-6 rounded-xl border border-slate-200 dark:border-slate-700",
        "hover:shadow-lg transition-all duration-200"
      )}
    >
      {/* Achievement Badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg shadow-md">
            <Medal className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
              Goal Achieved!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Target: {targetCount} items
            </p>
          </div>
        </div>
        {extraCount > 0 && (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
            +{extraCount} extra
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Timeline */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-sm">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Timeline</span>
          </div>
          
          <div className="space-y-3 pl-2 border-l-2 border-blue-100 dark:border-blue-800/50">
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 shadow-sm" />
              <p className="text-xs text-slate-600 dark:text-slate-400 pl-4">
                Started: {format(new Date(createdAt), 'PPP')}
              </p>
            </motion.div>
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-sm" />
              <p className="text-xs text-slate-600 dark:text-slate-400 pl-4">
                Completed: {format(new Date(completedAt), 'PPP')}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg shadow-sm">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress</span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-white/50 dark:bg-slate-800/50 shadow-sm">
                <Flag className="h-3 w-3 mr-1" />
                {daysToComplete} days
              </Badge>
              <Badge variant="outline" className="bg-white/50 dark:bg-slate-800/50 shadow-sm">
                <Target className="h-3 w-3 mr-1" />
                {currentCount} completed
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div 
                className={cn(
                  "h-full rounded-full",
                  progressPercentage >= 100 
                    ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                    : "bg-gradient-to-r from-blue-500 to-blue-600"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-2 text-xs"
            >
              <div className="p-1.5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-md border border-amber-200/50 dark:border-amber-800/50">
                <p className="font-medium text-amber-700 dark:text-amber-300">
                  {averagePerDay.toFixed(1)} per day
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}