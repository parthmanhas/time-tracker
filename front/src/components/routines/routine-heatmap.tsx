import { Card } from '@/components/ui/card';
import { ContributionGraph } from '@/components/ui/contribution-graph';
import { RoutineProgress } from '@/types/routine';

interface RoutineHeatmapProps {
  progress: RoutineProgress[];
}

export function RoutineHeatmap({ progress }: RoutineHeatmapProps) {
  return (
    <Card className="p-4">
      <ContributionGraph 
        data={progress.map(day => ({
          date: day.date,
          value: day.completed ? 1 : 0,
        }))}
        colorScale={(value) => value ? 'bg-green-600' : 'bg-secondary'}
      />
    </Card>
  );
}
