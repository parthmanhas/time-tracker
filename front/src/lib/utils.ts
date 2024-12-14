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

export const fetchAllTimers = async (setAllTimers: (timers: TimerType[]) => void) => {
  const response = await fetch("http://localhost:5000/api/timers");
  let dbTimers = await response.json() as TimerType[];
  dbTimers = dbTimers.map(timer => ({
    ...timer,
    status: timer.status === 'ACTIVE' ? 'PAUSED' : timer.status,
  }))
  setAllTimers(dbTimers);
  // store dbTimers in local storage
  //should be atmost one active timer, active timer stays local until completed or paused
  // const res = dbTimers.filter(timer => timer.completedAt?.split('T')[0] === convertToISODate(new Date().toLocaleDateString()))
  // console.log(dbTimers[0].completedAt)
  // console.log(new Date().toLocaleDateString().split('/').reverse())
  // console.log(res)
}