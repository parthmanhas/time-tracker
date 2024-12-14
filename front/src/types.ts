export type TimerStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

export type TimerType = {
    id: string
    title: string
    duration: number
    remainingTime: number
    tags?: string[]
    status: TimerStatus
    createdAt: string
    completedAt?: string
    comments?: string[]
}

export type CountType = {
  id: string
  title: string
  count: number
  date: string // ISO string for the day
  tags?: string[]
}

export type CountEntryType = {
  id: string
  countId: string
  value: number
  createdAt: string // ISO string with timestamp
}