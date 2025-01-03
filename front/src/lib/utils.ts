import { TimerResponseType, TimerStatus, TimerType } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { API } from '@/config/api'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const markComplete = async (timer: Pick<TimerType, 'id' | 'status'>, setStatus: (id: string, status: TimerStatus) => void, setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>) => {
  try {
    setIsLoading?.(true);
    await new Promise(resolve => setTimeout(resolve, 4000));
    await fetch(API.getUrl('TIMER'), {
      method: 'PATCH',
      credentials: 'include',
      body: JSON.stringify({ id: timer.id, status: 'COMPLETED', completedAt: new Date().toISOString(), remainingTime: 0 }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    setStatus(timer.id, 'COMPLETED');
  } catch (e) {
    console.error(e);
  } finally {
    setIsLoading?.(false);
  }
}

export const fetchAllTimers = async (setAllTimers: (timers: TimerType[]) => void, logout: () => void, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
  try {
    setIsLoading(true);
    const response = await fetch(API.getUrl('TIMERS'), {
      method: 'GET',
      credentials: 'include',
    });
    if(response.status === 401) {
      logout();
    }
    const jsonResponse = await response.json() as TimerResponseType[];
    const dbTimers: TimerType[] = jsonResponse.map(timer => ({
      ...timer,
      status: timer.status === 'ACTIVE' ? 'PAUSED' : timer.status,
      remainingTime: timer.remaining_time,
      createdAt: timer.created_at,
      completedAt: timer.completed_at,
      dueAt: timer.due_at,
      comments: (timer.comments || [])?.filter(Boolean).length > 0 ? timer.comments : []
    }))
    setAllTimers(dbTimers);
  } catch (e) {
    console.error(e);
  } finally {
    setIsLoading(false);
  }
}