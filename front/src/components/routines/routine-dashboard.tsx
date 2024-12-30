import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RoutineHeatmap } from './routine-heatmap';
import { useRoutine } from '@/context/routine-context';
import { Check, Plus } from 'lucide-react';
import { CreateRoutineDialog } from './create-routine-dialog';
import { WithLoading } from '@/hoc/hoc';
import { WithSidebarTrigger } from '../with-sidebar-trigger';

export function RoutineDashboard() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { routines, loading, handleComplete } = useRoutine();
  return (
    <WithLoading isLoading={loading} isScreen={true}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <WithSidebarTrigger>
              <h1 className="text-2xl font-bold">Routines</h1>
            </WithSidebarTrigger>
            <p>Track your fixed amount daily</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Routine
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {(routines).map(routine => (
            <Card key={routine.id} className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{routine.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    Streak: {routine.streak} days
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant={isCompletedToday(routine.last_completed_at) ? "secondary" : "default"}
                  onClick={() => handleComplete(routine.id)}
                  disabled={isCompletedToday(routine.last_completed_at)}
                >
                  {isCompletedToday(routine.last_completed_at) ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Done
                    </>
                  ) : (
                    'Complete'
                  )}
                </Button>
              </div>
              <RoutineHeatmap progress={routine.progress} />
            </Card>
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
