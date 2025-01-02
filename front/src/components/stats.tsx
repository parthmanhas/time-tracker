import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTimerStore } from '@/store/useTimerStore'
import { fetchAllTimers } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { subDays, startOfMonth, eachDayOfInterval, format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from '@/context/auth-context'
import { WithLoading } from '@/hoc/hoc'
import { WithSidebarTrigger } from './with-sidebar-trigger'

export function Stats() {
  const { allTimers, setAllTimers } = useTimerStore()
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetchAllTimers(setAllTimers, logout, setIsLoading);
  }, [])

  // Get time spent per tag for a given time period
  const getTimePerTag = (startDate: Date) => {
    const tagTimes: { [key: string]: number } = {};

    allTimers.forEach(timer => {
      if (!timer.completedAt || !timer.tags) return;
      const completedDate = new Date(timer.completedAt);

      if (completedDate >= startDate) {
        timer.tags.forEach(tag => {
          tagTimes[tag] = (tagTimes[tag] || 0) + timer.duration;
        });
      }
    });

    return Object.entries(tagTimes).map(([tag, seconds]) => ({
      tag,
      hours: Math.round((seconds / 3600) * 10) / 10
    }));
  };

  // Modified getLast30DaysData function to include hours
  const getLast30DaysData = () => {
    const end = new Date()
    const start = subDays(end, 29)
    const dateRange = eachDayOfInterval({ start, end })

    const dailyData = allTimers.reduce((acc, timer) => {
      if (!timer.completedAt) return acc
      const date = timer.completedAt.split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          count: 0,
          hours: 0
        }
      }
      acc[date].count += 1
      acc[date].hours += timer.duration / 3600 // Convert seconds to hours
      return acc
    }, {} as Record<string, { count: number, hours: number }>)

    return dateRange.map(date => ({
      date: format(date, 'MMM dd'),
      completed: dailyData[format(date, 'yyyy-MM-dd')]?.count || 0,
      hours: Math.round((dailyData[format(date, 'yyyy-MM-dd')]?.hours || 0) * 10) / 10
    }))
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-violet-200/50 dark:border-violet-800/50 rounded-lg shadow-lg p-3">
          <p className="font-medium text-violet-900 dark:text-violet-100">{label}</p>
          <div className="space-y-1 mt-1.5">
            <p className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              Completed: {payload[0]?.value} timer{payload[0]?.value !== 1 ? 's' : ''}
            </p>
            <p className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-300" />
              Total Time: {payload[1]?.value} hours
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const timeRanges = {
    day: getTimePerTag(subDays(new Date(), 1)),
    threeDays: getTimePerTag(subDays(new Date(), 3)),
    week: getTimePerTag(subDays(new Date(), 7)),
    month: getTimePerTag(startOfMonth(new Date()))
  };

  // New function to get tag history data
  const getTagHistoryData = () => {
    const end = new Date()
    const start = subDays(end, 29)
    const dateRange = eachDayOfInterval({ start, end })

    // Initialize data structure with all dates and tags
    const uniqueTags = new Set<string>()
    allTimers.forEach(timer => {
      timer.tags?.forEach(tag => uniqueTags.add(tag))
    })

    // Create daily records for each tag
    const tagHistory = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayData: { [key: string]: number } = {}

      // Initialize all tags with 0 hours
      uniqueTags.forEach(tag => {
        dayData[tag] = 0
      })

      // Add hours for each tag on this day
      allTimers.forEach(timer => {
        if (!timer.completedAt || !timer.tags) return
        const completedDate = timer.completedAt.split('T')[0]
        if (completedDate === dateStr) {
          timer.tags.forEach(tag => {
            dayData[tag] = (dayData[tag] || 0) + (timer.duration / 3600)
          })
        }
      })

      return dayData
    })

    return {
      data: tagHistory,
      tags: Array.from(uniqueTags)
    }
  }

  const { data: tagHistoryData, tags: uniqueTags } = getTagHistoryData()

  // Add a custom tooltip for tag history
  const TagHistoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Filter out tags with 0 hours
      const nonZeroTags = payload.filter((entry: any) => entry.value > 0)

      if (nonZeroTags.length === 0) return null;

      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          {nonZeroTags.map((entry: any) => (
            <p key={entry.dataKey} className="text-sm flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              <span>{entry.dataKey}:</span>
              <span>
                {Math.floor(entry.value)}h {Math.round((entry.value % 1) * 60)}m
              </span>
            </p>
          ))}
          <div className="mt-2 pt-2 border-t text-sm">
            <strong>Total: </strong>
            {(() => {
              const total = nonZeroTags.reduce((sum: number, entry: any) => sum + entry.value, 0)
              const hours = Math.floor(total)
              const minutes = Math.round((total % 1) * 60)
              return `${hours}h ${minutes}m`
            })()}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="container mx-auto p-4 sm:p-8 space-y-8 max-w-7xl">
      <WithLoading isLoading={isLoading} size={80} isScreen={true}>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row gap-1 items-start bg-gradient-to-r from-violet-50/80 to-violet-100/80 dark:from-violet-950/40 dark:to-violet-900/40 p-4 sm:p-6 rounded-xl shadow-lg border border-violet-200/50 dark:border-violet-800/50 backdrop-blur-sm">
          <WithSidebarTrigger>
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-violet-300">
                Statistics
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Track your progress and analyze patterns</p>
            </div>
          </WithSidebarTrigger>
          <p className="text-sm text-muted-foreground sm:hidden">Track your progress and analyze patterns</p>
        </div>

        <div className="grid gap-6">
          {/* 30 Day History */}
          <Card className="overflow-hidden border-violet-100 dark:border-violet-900/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight text-violet-900 dark:text-violet-100">
                30 Day History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getLast30DaysData()}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                    <XAxis
                      dataKey="date"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="left"
                      allowDecimals={false}
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      label={{
                        value: 'Completed Timers',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fill: 'currentColor' }
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      label={{
                        value: 'Hours',
                        angle: 90,
                        position: 'insideRight',
                        style: { fill: 'currentColor' }
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      yAxisId="left"
                      dataKey="completed"
                      className="fill-violet-500 dark:fill-violet-400"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="hours"
                      className="fill-violet-300 dark:fill-violet-600"
                      radius={[4, 4, 0, 0]}
                      opacity={0.7}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {/* Time per Tag stats */}
          <Card className="overflow-hidden border-violet-100 dark:border-violet-900/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight text-violet-900 dark:text-violet-100">
                Time per Tag
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="day" className="w-full">
                <TabsList className="mb-4 bg-violet-50 dark:bg-violet-900/50">
                  {["Last 24h", "Last 3 Days", "Last Week", "This Month"].map((label, i) => (
                    <TabsTrigger
                      key={label}
                      value={["day", "threeDays", "week", "month"][i]}
                      className="data-[state=active]:bg-violet-100 dark:data-[state=active]:bg-violet-800"
                    >
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(timeRanges).map(([range, data]) => (
                  <TabsContent key={range} value={range} className="h-[300px]">
                    {data.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                          <XAxis
                            dataKey="tag"
                            tick={{ fill: 'currentColor', fontSize: 12 }}
                          />
                          <YAxis
                            tick={{ fill: 'currentColor', fontSize: 12 }}
                            label={{
                              value: 'Hours',
                              angle: -90,
                              position: 'insideLeft',
                              style: { fill: 'currentColor' }
                            }}
                          />
                          <Tooltip />
                          <Bar
                            dataKey="hours"
                            className="fill-violet-500 dark:fill-violet-400"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No data available for this period
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* 30 Day Tag History */}
          <Card className="overflow-hidden border-violet-100 dark:border-violet-900/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight text-violet-900 dark:text-violet-100">
                30 Day Tag History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tagHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                    <XAxis
                      dataKey="date"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      label={{
                        value: 'Hours',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fill: 'currentColor' }
                      }}
                    />
                    <Tooltip content={<TagHistoryTooltip />} />
                    <Legend />
                    {uniqueTags.map((tag, index) => (
                      <Bar
                        key={tag}
                        dataKey={tag}
                        stackId="a"
                        fill={`hsl(${(index * (360 / uniqueTags.length) + 270) % 360}, 70%, 60%)`}
                        radius={[index === uniqueTags.length - 1 ? 4 : 0, index === uniqueTags.length - 1 ? 4 : 0, 0, 0]}
                        barSize={30}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </WithLoading>
    </div>
  )
}