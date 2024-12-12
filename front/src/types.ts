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