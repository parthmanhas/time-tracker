import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTimerStore } from '@/store/useTimerStore'
import { subDays, format, eachDayOfInterval } from 'date-fns'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { fetchAllTimers } from '@/lib/utils'

export function Stats() {
  const { allTimers, setAllTimers } = useTimerStore()

  React.useEffect(() => {
    fetchAllTimers(setAllTimers);
  }, [])

  const getCompletedTimersCount = (daysAgo: number) => {
    const date = subDays(new Date(), daysAgo)
    date.setHours(0, 0, 0, 0)

    return allTimers.filter(timer => {
      if (timer.status !== 'COMPLETED' || !timer.completedAt) return false
      const completedDate = new Date(timer.completedAt)
      return completedDate >= date
    }).length
  }

  const getTimeSpent = (daysAgo: number) => {
    const date = subDays(new Date(), daysAgo)
    date.setHours(0, 0, 0, 0)

    const seconds = allTimers.reduce((acc, timer) => {
      if (timer.status !== 'COMPLETED' || !timer.completedAt) return acc
      const completedDate = new Date(timer.completedAt)
      if (completedDate >= date) {
        return acc + timer.duration
      }
      return acc
    }, 0)

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getLast30DaysData = () => {
    const end = new Date()
    const start = subDays(end, 29)
    const dateRange = eachDayOfInterval({ start, end })

    const completedByDate = allTimers.reduce((acc, timer) => {
      if (timer.status !== 'COMPLETED' || !timer.completedAt) return acc
      const date = timer.completedAt.split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return dateRange.map(date => ({
      name: format(date, 'MMM dd'),
      total: completedByDate[format(date, 'yyyy-MM-dd')] || 0,
    }))
  }

  const completedStats = [
    {
      title: "Last 24 Hours",
      value: getCompletedTimersCount(1),
    },
    {
      title: "Last 3 Days",
      value: getCompletedTimersCount(3),
    },
    {
      title: "Last 7 Days",
      value: getCompletedTimersCount(7),
    },
  ]

  const timeStats = [
    {
      title: "Last 24 Hours",
      value: getTimeSpent(1),
    },
    {
      title: "Last 3 Days",
      value: getTimeSpent(3),
    },
    {
      title: "Last 7 Days",
      value: getTimeSpent(7),
    },
  ]

  const chartData = getLast30DaysData()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Timer Statistics</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed Timers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedStats.map((stat) => (
              <div key={stat.title} className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Time Spent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {timeStats.map((stat) => (
              <div key={stat.title} className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 30 Days Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Timers - Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={true}
                  axisLine={true}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={true}
                  axisLine={true}
                  allowDecimals={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Bar
                  dataKey="total"
                  fill="currentColor"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 