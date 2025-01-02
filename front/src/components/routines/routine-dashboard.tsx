import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RoutineHeatmap } from './routine-heatmap';
import { useRoutine } from '@/context/routine-context';
import { Check, Plus, Target } from 'lucide-react';
import { CreateRoutineDialog } from './create-routine-dialog';
import { WithLoading } from '@/hoc/hoc';
import { WithSidebarTrigger } from '../with-sidebar-trigger';
import { motion } from 'framer-motion';

export function RoutineDashboard() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { routines, loading, handleComplete } = useRoutine();
  return (
    <WithLoading isLoading={loading} isScreen={true}>
      <div className="container mx-auto p-8 space-y-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/20 p-6 rounded-lg shadow-sm border border-teal-200/50 dark:border-teal-800/50">
          <div className="space-y-1">
            <WithSidebarTrigger>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent dark:from-teal-400 dark:to-teal-300">
                  Routines
                </h1>
                <p className="text-muted-foreground hidden sm:block">Build lasting habits with daily tracking</p>
              </div>
            </WithSidebarTrigger>
            <p className="text-muted-foreground sm:hidden">Build lasting habits with daily tracking</p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="lg"
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all dark:bg-teal-700 dark:hover:bg-teal-600"
          >
            <Plus className="mr-2 h-5 w-5" /> New Routine
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {routines.map(routine => (
            <motion.div
              key={routine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 space-y-6 hover:shadow-lg transition-all duration-300 border-teal-200/50 dark:border-teal-800/50">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold tracking-tight text-teal-900 dark:text-teal-100">
                        {routine.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400">
                        <Target className="h-4 w-4" />
                        <span>Daily Target: {routine.daily_target}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isCompletedToday(routine.last_completed_at) ? "secondary" : "default"}
                      onClick={() => handleComplete(routine.id)}
                      disabled={isCompletedToday(routine.last_completed_at)}
                      className={`shadow-sm hover:shadow-md transition-all ${isCompletedToday(routine.last_completed_at)
                          ? 'bg-teal-100 text-teal-900 hover:bg-teal-200 dark:bg-teal-900 dark:text-teal-100'
                          : 'bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600'
                        }`}
                    >
                      {isCompletedToday(routine.last_completed_at) ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Completed
                        </>
                      ) : (
                        'Complete'
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-teal-700 dark:text-teal-300">Current Streak</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">{routine.streak} days</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-teal-200/50 dark:border-teal-800/50">
                  <RoutineHeatmap progress={routine.progress} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <CreateRoutineDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </WithLoading>
  );
}

function isCompletedToday(lastCompletedAt: Date | null): boolean {
  if (!lastCompletedAt) return false;
  const today = new Date();
  const lastCompleted = new Date(lastCompletedAt);
  return (
    today.getFullYear() === lastCompleted.getFullYear() &&
    today.getMonth() === lastCompleted.getMonth() &&
    today.getDate() === lastCompleted.getDate()
  );
}
