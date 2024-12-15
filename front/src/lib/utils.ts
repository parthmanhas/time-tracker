import { TimerResponseType, TimerStatus, TimerType } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { API } from '@/config/api'

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

export const fetchAllTimers = async (setAllTimers: (timers: TimerType[]) => void) => {
  const response = await fetch(API.getUrl('TIMERS'));
  const jsonResponse = await response.json() as TimerResponseType[];
  const dbTimers: TimerType[] = jsonResponse.map(timer => ({
    ...timer,
    status: timer.status === 'ACTIVE' ? 'PAUSED' : timer.status,
    remainingTime: timer.remaining_time,
    createdAt: timer.created_at,
    completedAt: timer.completed_at,
    dueAt: timer.due_at,
  }))
  setAllTimers(dbTimers);
}