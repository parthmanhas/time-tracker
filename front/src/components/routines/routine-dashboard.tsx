import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RoutineHeatmap } from './routine-heatmap';
import { useRoutine } from '@/context/routine-context';
import { Check, Plus, Target } from 'lucide-react';
import { CreateRoutineDialog } from './create-routine-dialog';
import { WithLoading } from '@/hoc/hoc';
import { WithSidebarTrigger } from '../with-sidebar-trigger';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

export function RoutineDashboard() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { routines, loading, handleComplete } = useRoutine();
  return (
    <WithLoading isLoading={loading} isScreen={true}>
      <div className="container mx-auto p-8 space-y-8 max-w-7xl">
        <div className="flex justify-between items-center bg-card p-6 rounded-lg shadow-sm">
          <div className="space-y-1">
            <WithSidebarTrigger>
              <h1 className="text-3xl font-bold tracking-tight">Routines</h1>
            </WithSidebarTrigger>
            <p className="text-muted-foreground">Build lasting habits with daily tracking</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="lg" className="shadow-md hover:shadow-lg transition-all">
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
              <Card className="p-6 space-y-6 hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold tracking-tight">{routine.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-4 w-4" />
                        <span>Daily Target: {routine.daily_target}</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant={isCompletedToday(routine.last_completed_at) ? "secondary" : "default"}
                      onClick={() => handleComplete(routine.id)}
                      disabled={isCompletedToday(routine.last_completed_at)}
                      className="shadow-sm hover:shadow-md transition-all"
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
                      <span className="font-medium">Current Streak</span>
                      <span className="font-bold text-primary">{routine.streak} days</span>
                    </div>
                    <Progress value={(routine.streak / 30) * 100} className="h-2" />
                  </div>
                </div>

                <div className="pt-4 border-t">
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
