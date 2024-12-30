import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface ContributionDay {
  date: Date;
  value: number;
  label?: string;
}

interface ContributionGraphProps {
  data: ContributionDay[];
  colorScale?: (value: number) => string;
  className?: string;
}

export function ContributionGraph({
  data,
  colorScale = defaultColorScale,
  className,
}: ContributionGraphProps) {
  return (
    <div className={cn('flex gap-1 flex-wrap', className)}>
      {data.map((day, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger>
              <div
                className={cn(
                  'w-3 h-3 rounded-sm transition-colors',
                  colorScale(day.value)
                )}
              />
            </TooltipTrigger>
            <TooltipContent>
              {day.label || formatDate(day.date)}: {Math.round(day.value * 100)}%
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function defaultColorScale(value: number): string {
  if (value === 0) return 'bg-secondary';
  if (value <= 0.25) return 'bg-green-200';
  if (value <= 0.5) return 'bg-green-400';
  if (value <= 0.75) return 'bg-green-600';
  return 'bg-green-800';
}
