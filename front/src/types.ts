export type TimerStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

export type TimerResponseType = {
    id: string
    title: string
    duration: number
    remaining_time: number
    tags?: string[]
    status: TimerStatus
    created_at: string
    completed_at?: string,
    due_at?: string,
    comments?: string[]
}

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

export type JournalEntry = {
  id: string
  content: string
  created_at: string
  user_id: string
}

export type GoalPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type GoalType = 'TIME' | 'COUNT';

export type Goal = {
  id: string;
  title: string;
  description?: string;
  target_hours?: number;
  target_count?: number;
  current_count?: number;
  type: GoalType;
  priority: GoalPriority;
  tags: string[];
  created_at: string;
  completed_at?: string;
  is_active: boolean;
}

export type GoalProgress = {
  goalId: string;
  currentHours: number;
  percentageComplete: number;
  remainingHours: number;
}