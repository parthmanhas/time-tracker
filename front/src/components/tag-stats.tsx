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
import { ArrowUpDown } from "lucide-react"
import { fetchAllTimers } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

type SortOption = 'name' | 'timeAsc' | 'timeDesc'

export function TagStats() {
  const { allTimers } = useTimerStore()
  const { id: userId } = useAuth()?.user || {};
  const [sortBy, setSortBy] = React.useState<SortOption>('name')

  const {
    setAllTimers
  } = useTimerStore();

  React.useEffect(() => {
    fetchAllTimers(userId, setAllTimers);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tag Statistics</h1>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => setSortBy(value)}
          >
            <SelectTrigger className="w-[180px]">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tagStats.map(({ tag, count, timeSpent }) => (
          <Card key={tag}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                <Badge variant={tag ? "default" : "destructive"} className="mr-2">
                  {tag || 'UNTAGGED'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                  <p className="text-2xl font-bold">{formatTime(timeSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 