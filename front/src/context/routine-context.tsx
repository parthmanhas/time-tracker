import React, { createContext, useEffect, useState } from 'react';
import { Routine, RoutineProgress } from '@/types/routine';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { API } from '@/config/api';
import { isSameDay } from 'date-fns';

interface RoutineContextType {
  loading: boolean;
  routines: Routine[];
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'streak' | 'lastCompleted'>) => Promise<void>;
  // updateProgress: (routineId: string, progress: number) => Promise<void>;
  // getProgress: (routineId: string) => Promise<RoutineProgress[]>;
  handleComplete: (routineId: string) => Promise<void>;
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

export function RoutineProvider({ children }: { children: React.ReactNode }) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const add15DatesEitherSideOfToday = (routine: Routine): Routine => {
    const progress: RoutineProgress[] = [];
    const today = new Date();

    //create an array of {date, completed} objects for the +- 15 days from today
    for (let i = 15; i >= -15; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      progress.push({
        date,
        completed: routine.progress.some((p: RoutineProgress) => isSameDay(new Date(p.completed_at), date))
      });
    }
    return { ...routine, progress };
  }

  // Load routines from API and cache
  const fetchRoutines = async () => {
    setLoading(true);
    try {
      const response = await fetch(API.getUrl('ROUTINES'), {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch routines');

      const routines = (await response.json() as Routine[]).map(add15DatesEitherSideOfToday);
      setRoutines(routines);
      localStorage.setItem('cached_routines', JSON.stringify({
        timestamp: Date.now(),
        routines
      }));
    } catch (error) {
      console.error('Error fetching routines:', error);
      // If fetch fails, use cached data
      const cached = localStorage.getItem('cached_routines');
      if (cached) {
        const { data } = JSON.parse(cached);
        setRoutines(data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load - check cache first, then fetch
  useEffect(() => {
    if (!user) return;

    // const cached = localStorage.getItem('cached_routines');
    // if (cached) {
    //   const { timestamp, routines } = JSON.parse(cached);
    //   // Use cache if less than 5 minutes old
    //   if (Date.now() - timestamp < 5 * 60 * 1000) {
    //     // console.log(data)
    //     setRoutines(routines);
    //     return;
    //   }
    // }
    fetchRoutines();
  }, [user]);

  useEffect(() => {
    // Check for missed routines daily
    const checkMissedRoutines = () => {
      const today = new Date();
      routines.forEach(routine => {
        if (routine.last_completed_at) {
          const daysSinceLastCompleted = Math.floor(
            (today.getTime() - new Date(routine.last_completed_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceLastCompleted > 1) {
            toast({
              title: "Missed Routine",
              description: `You haven't completed "${routine.title}" for ${daysSinceLastCompleted} days!`,
              variant: "destructive",
            });
          }
        }
      });
    };

    checkMissedRoutines();
    const interval = setInterval(checkMissedRoutines, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [routines]);

  const addRoutine = async (routine: Partial<Routine>) => {
    setLoading(true);
    try {
      const response = await fetch(API.getUrl('ROUTINES'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...routine }),
      });

      if (!response.ok) {
        throw new Error('Failed to add routine');
      }

      const savedRoutine = await response.json() as Routine;

      setRoutines(prev => [...prev, add15DatesEitherSideOfToday({...savedRoutine, progress: []})]);

      // Update cache with new routine
      const cached = localStorage.getItem('cached_routines');
      if (cached) {
        const { timestamp, routines } = JSON.parse(cached);
        localStorage.setItem('cached_routines', JSON.stringify({
          timestamp,
          data: [...routines, savedRoutine]
        }));
      }

      toast({
        title: "Routine Created",
        description: `${routine.title} has been created successfully.`,
      });
    } catch {
      toast({
        title: "Error creating routine",
        description: "Try again after some time",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }

  };

  const updateProgress = async (routineId: string, progress: number) => {
    setRoutines(prev => prev.map(routine => {
      if (routine.id !== routineId) return routine;

      const today = new Date();
      const lastCompleted = routine.last_completed_at ? new Date(routine.last_completed_at) : null;
      let newStreak = routine.streak;

      // Reset streak if more than 1 day has passed
      if (lastCompleted &&
        Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)) > 1) {
        newStreak = 0;
      }
      // Increment streak if progress is complete and it's a new day
      else if (progress >= 1 &&
        (!lastCompleted ||
          lastCompleted.toDateString() !== today.toDateString())) {
        newStreak += 1;
      }

      return {
        ...routine,
        progress,
        streak: newStreak,
        lastCompleted: progress >= 1 ? today : routine.last_completed_at,
      };
    }));
  };

  const handleComplete = async (routineId: string) => {
    setLoading(true);
    try {
      await fetch(`${API.getUrl('ROUTINES')}/${routineId}`, {
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify({ last_completed_at: new Date().toISOString() }),
      });
    } catch (error) {
      console.error('Error completing routine:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = async (routineId: string) => {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return [];

    // make call to get routine_progress data
    try {
      const response = await fetch(`${API.getUrl('ROUTINES')}/${routineId}/progress`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch routine progress');

      const progressData = await response.json();
      const progress: RoutineProgress[] = [];
      const today = new Date();

      //create an array of {date, completed} objects for the +- 15 days from today
      for (let i = 15; i >= -15; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString();

        progress.push({
          date: new Date(dateStr),
          completed: progressData.some((p: RoutineProgress) => isSameDay(new Date(p.date), date))
        });
      }
      return progress;
    } catch (error) {
      console.error('Error fetching routine progress:', error);
      return [];
    }


    // Generate last 30 days of progress

  };

  return (
    <RoutineContext.Provider value={{
      routines,
      addRoutine,
      // updateProgress,
      handleComplete,
      loading
    }}>
      {children}
    </RoutineContext.Provider>
  );
}

export function useRoutine() {
  const context = React.useContext(RoutineContext);
  if (context === undefined) {
    throw new Error('useRoutine must be used within a RoutineProvider');
  }
  return context;
}
