import { TimerStatus, TimerType } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const markComplete = async (timer: Pick<TimerType, 'id' | 'status'>, setStatus: (id: string, status: TimerStatus) => void) => {
  try {
      await fetch('http://localhost:5000/api/timer', {
          method: 'PATCH',
          body: JSON.stringify({ id: timer.id, status: 'COMPLETED', completedAt: new Date().toISOString(), remainingTime: 0 }),
          headers: {
              'Content-Type': 'application/json'
          }
      })
      setStatus(timer.id, 'COMPLETED');
  } catch (e) {
      console.error(e);
  }
}