import { TimerType } from '@/types';
import { create } from 'zustand';

type ActiveFilter = 'ALL' | 'ACTIVE' | 'QUEUED' | 'COMPLETED';
type TimerStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';

type TimerStoreStateType = {
    allTimers: TimerType[],
    filteredTimers: TimerType[],
    activeFilter: ActiveFilter,
    date: string,
    setDateFilter: (date: string) => void,
    setActiveFilter: (filter: ActiveFilter) => void,
    setAllTimers: (timers: TimerType[]) => void,
    setStatus: (id: string, status: TimerStatus) => void,
    setRemainingTime: (id: string, remainingTime: number) => void,
    addComment: (id: string, comment: string) => void,
    addTag: (id: string, tag: string) => void,
    setDuration: (id: string, duration: number) => void,
    setTitle: (id: string, title: string) => void

    //new Timer
    newTimerTitle: string,
    newTimerDuration: string,
    setNewTimerTitle: (title: string) => void,
    setNewTimerDuration: (duration: string) => void
    addNewTimer: (timer: TimerType) => void

    //single timer
    newComment: string,
    newTag: string,
}

export const useTimerStore = create<TimerStoreStateType>((set) => ({
    allTimers: [],
    filteredTimers: [],
    activeFilter: 'ALL',
    date: new Date().toISOString(),
    setDateFilter: (date) => set(state => ({ ...state, date })),
    setActiveFilter: (activeFilter: ActiveFilter) => set((state) => ({ ...state, activeFilter })),
    setAllTimers: (allTimers) => set((state) => ({ ...state, allTimers })),
    setStatus: (id: string, status: TimerStatus) =>
        set((state) => ({
            allTimers: state.allTimers.map((timer) =>
                timer.id === id ? { ...timer, status } : timer
            ),
        })),

    setRemainingTime: (id: string, remainingTime: number) =>
        set((state) => ({
            allTimers: state.allTimers.map((timer) =>
                timer.id === id ? { ...timer, remainingTime } : timer
            ),
        })),

    addComment: (id: string, comment: string) =>
        set((state) => ({
            allTimers: state.allTimers.map((timer) =>
                timer.id === id
                    ? { ...timer, comments: [...(timer.comments || []), comment] }
                    : timer
            ),
        })),

    addTag: (id: string, tag: string) =>
        set((state) => ({
            allTimers: state.allTimers.map((timer) =>
                timer.id === id ? { ...timer, tags: [...(timer.tags || []), tag] } : timer
            ),
        })),

    setDuration: (id: string, duration: number) =>
        set((state) => ({
            allTimers: state.allTimers.map((timer) =>
                timer.id === id ? { ...timer, duration } : timer
            ),
        })),

    setTitle: (id: string, title: string) =>
        set((state) => ({
            allTimers: state.allTimers.map((timer) =>
                timer.id === id ? { ...timer, title } : timer
            ),
        })),

    // new timer
    newTimerTitle: '',
    newTimerDuration: '600',
    setNewTimerTitle: (newTimerTitle) => set(state => ({ ...state, newTimerTitle })),
    setNewTimerDuration: (newTimerDuration) => set(state => ({ ...state, newTimerDuration })),
    clearNewTimer: set(state => ({ ...state, newTimerTitle: '', newTimerDuration: '600' })),
    addNewTimer: timer => set(state => ({
        allTimers: [...state.allTimers, timer],
    })),

    // existing timer
    newComment: '', // reference variable to add new comment
    newTag: '', //// reference variable to add new tag
}));
