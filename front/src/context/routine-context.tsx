import React, { createContext, useEffect, useState } from 'react';
import { Routine, RoutineProgress, RoutineResponse } from '@/types/routine';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { API } from '@/config/api';
import { differenceInDays, isSameDay } from 'date-fns';

interface RoutineContextType {
  loading: boolean;
  routines: Routine[];
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'streak' | 'lastCompleted' | 'user_id' | 'last_completed_at' | 'created_at' | 'progress'>) => Promise<void>;
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

  const add15DatesEitherSideOfToday = (routine: RoutineResponse): Routine => {
    const progress: RoutineProgress[] = [];
    const today = new Date();
    //create an array of {date, completed} objects for the +- 15 days from today
    for (let i = 15; i >= -15; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      progress.push({
        date,
        completed: routine.progress.some(p => isSameDay(new Date(p.completed_at), date))
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

      const routines = (await response.json() as RoutineResponse[]).map(add15DatesEitherSideOfToday);
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

      setRoutines(prev => [...prev, add15DatesEitherSideOfToday({ ...savedRoutine, progress: [] })]);

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

  const handleComplete = async (routine: Routine) => {
    setLoading(true);
    let streak = 0;
    if (routine.last_completed_at && differenceInDays(new Date(), new Date(routine.last_completed_at)) === 1) {
      streak = 1;
    }
    try {
      const response = await fetch(`${API.getUrl('ROUTINES')}/${routine.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          last_completed_at: new Date().toISOString(),
          streak: { increment: streak }
        }),
      });
      const updatedRoutine = await response.json() as RoutineResponse;
      setRoutines(prev => prev.map(r => {
        if (routine.id !== routine.id) return r;
        return {
          ...r,
          last_completed_at: new Date(),
          progress: routine.progress.map(p => ({
            ...p,
            completed: isSameDay(p.date, new Date())
          })),
          streak: updatedRoutine.streak
        };
      }));

    } catch (error) {
      console.error('Error completing routine:', error);
    } finally {
      setLoading(false);
    }
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
