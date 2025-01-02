import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTimerStore } from '@/store/useTimerStore'
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown, Tag, Clock, CheckCircle } from "lucide-react"
import { fetchAllTimers } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'
import { WithLoading } from '@/hoc/hoc'
import { WithSidebarTrigger } from './with-sidebar-trigger'
import { cn } from '@/lib/utils'
import { Separator } from './ui/separator'
import { motion } from 'framer-motion';

type SortOption = 'name' | 'timeAsc' | 'timeDesc'

export function TagStats() {
  const { allTimers } = useTimerStore()
  const [sortBy, setSortBy] = React.useState<SortOption>('name')
  const [isLoading, setIsLoading] = React.useState(true);

  const {
    setAllTimers
  } = useTimerStore();

  const { logout } = useAuth();

  React.useEffect(() => {
    fetchAllTimers(setAllTimers, logout, setIsLoading);
  }, [])

  const tagStats = React.useMemo(() => {
    const stats = new Map<string, { count: number; timeSpent: number }>()

    allTimers.forEach(timer => {
      timer.tags?.forEach(tag => {
        const current = stats.get(tag) || { count: 0, timeSpent: 0 }
        if (timer.status === 'COMPLETED') {
          stats.set(tag, {
            count: current.count + 1,
            timeSpent: current.timeSpent + timer.duration
          })
        }
      })
    })

    const statsArray = Array.from(stats.entries()).map(([tag, data]) => ({
      tag,
      count: data.count,
      timeSpent: data.timeSpent
    }))

    // Sort based on selected option
    switch (sortBy) {
      case 'name':
        return statsArray.sort((a, b) => a.tag?.localeCompare(b.tag))
      case 'timeAsc':
        return statsArray.sort((a, b) => a.timeSpent - b.timeSpent)
      case 'timeDesc':
        return statsArray.sort((a, b) => b.timeSpent - a.timeSpent)
      default:
        return statsArray
    }
  }, [allTimers, sortBy])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="container mx-auto p-6">
      <WithLoading isLoading={isLoading} isScreen={true}>
        <div className="space-y-6">
          {/* New Header Section */}
          {/* <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 p-6 rounded-lg shadow-sm border border-green-200/50 dark:border-green-800/50">
            <div className="space-y-1">
              <WithSidebarTrigger>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent dark:from-green-400 dark:to-green-300">
                  Routines
                </h1>
              </WithSidebarTrigger>
              <p className="text-muted-foreground">Build lasting habits with daily tracking</p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="lg"
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all dark:bg-green-700 dark:hover:bg-green-600"
            >
              <Plus className="mr-2 h-5 w-5" /> New Routine
            </Button>
          </div> */}
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 p-6 rounded-lg shadow-sm border border-green-200/50 dark:border-green-800/50">
            <div className="flex items-center gap-3">
              <WithSidebarTrigger>
                <div>
                  <h1 className="text-3xl font-bold leading-10 tracking-tight bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent dark:from-green-400 dark:to-green-300">
                    Tag Statistics
                  </h1>
                  <p className="text-sm text-slate-500">Track your productivity by tags</p>
                </div>
              </WithSidebarTrigger>
            </div>

            <div className="flex items-center self-center gap-2 bg-slate-50 p-2 rounded-lg">
              <ArrowUpDown className="h-4 w-4 text-slate-500" />
              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <SelectTrigger className="w-[180px] border-none bg-transparent">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Tag Name</SelectItem>
                  <SelectItem value="timeAsc">Least Time Spent</SelectItem>
                  <SelectItem value="timeDesc">Most Time Spent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tagStats.map(({ tag, count, timeSpent }) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card key={tag} className={cn(
                  "bg-gradient-to-br from-white to-slate-50",
                  "hover:shadow-md transition-all duration-200"
                )}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-slate-400" />
                      <Badge
                        variant={tag ? "default" : "destructive"}
                        className={cn(
                          "font-medium",
                          tag ? "bg-green-100 text-green-700 hover:bg-green-200" : ""
                        )}
                      >
                        {tag || 'UNTAGGED'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Completed</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{count}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span>Time Spent</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{formatTime(timeSpent)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </WithLoading>
    </div>
  )
}