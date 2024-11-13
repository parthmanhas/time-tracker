export type TimerType = {
    id: string
    title: string
    duration: number
    remainingTime: number
    tags?: string[]
    status: "ACTIVE" | "PAUSED" | "COMPLETED"
    createdAt: string
    completedAt?: string
    comments?: string[]
}