import { format } from 'date-fns'
import { Badge } from './ui/badge'
import { Calendar, Clock, Medal, TrendingUp, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

type CompletedTimeGoalProps = {
  goalCreatedAt: string
  completedAt: string
  daysToComplete: number
  totalHours: number
}

export function CompletedTimeGoal({
  goalCreatedAt,
  completedAt,
  daysToComplete,
  totalHours
}: CompletedTimeGoalProps) {
  const averageHoursPerDay = (totalHours / (daysToComplete || 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-900 dark:to-slate-800",
        "p-6 flex-1",
        "hover:shadow-lg transition-all duration-200"
      )}
    >
      {/* Achievement Badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg shadow-md">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              Time Goal Achieved!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total: {Math.round(totalHours)} hours
            </p>
          </div>
        </div>

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
                Started: {format(new Date(goalCreatedAt), 'PPP')}
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
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Stats</span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-white/50 dark:bg-slate-800/50 shadow-sm">
                <Clock className="h-3 w-3 mr-1" />
                {Math.round(totalHours)}h logged
              </Badge>
              <Badge variant="outline" className="bg-white/50 dark:bg-slate-800/50 shadow-sm">
                <Medal className="h-3 w-3 mr-1" />
                {daysToComplete} days
              </Badge>
            </div>

            {/* Progress Animation */}
            <motion.div
              className="w-full h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              style={{ transformOrigin: 'left' }}
            />

            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-2 text-xs"
            >
              <Badge className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white border-0">
                {Math.round(averageHoursPerDay * 10) / 10}h/day
              </Badge>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}