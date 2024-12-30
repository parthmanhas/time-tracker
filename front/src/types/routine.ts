import { GoalType } from "@/types";

export interface Routine {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: GoalType;
  daily_target: number; // count or minutes
  streak: number;
  last_completed_at: Date | null;
  created_at: Date;
  progress: RoutineProgress[];
}

export interface RoutineProgress {
  date: Date;
  completed: boolean;
}
