import { Pause, Play, CheckCircle, MoreVertical } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Button } from './ui/button'
import { Badge } from "./ui/badge"
import { TimerType } from "@/types"
import { useTimerStore } from "@/store/useTimerStore"
import { markComplete } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCallback } from "react"

type TimerProps = {
  timer: TimerType,
  workerRef: React.MutableRefObject<Worker | null>
}

export function CompactTimer({ timer, workerRef }: TimerProps) {
  const { setStatus } = useTimerStore();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => {
    setStatus(timer.id, timer.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE');
    workerRef.current?.postMessage({
      type: timer.status === 'ACTIVE' ? 'STOP_TIMER' : 'START_TIMER',
      payload: { id: timer.id, remainingTime: timer.remainingTime },
    });
  }

  const handleViewDetails = useCallback(() => {
    // Store the timer ID in localStorage before switching views
    localStorage.setItem('highlightTimerId', timer.id);
    // Trigger view change through a custom event
    window.dispatchEvent(new CustomEvent('switchToGridView'));
  }, [timer.id]);

  return (
    <Card onClick={handleViewDetails} className="hover:shadow-md transition-shadow hover:cursor-pointer">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {timer.status === 'COMPLETED' ? (
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 flex-shrink-0"
                onClick={toggleTimer}
              >
                {timer.status === 'ACTIVE' ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            )}
            <div className="truncate">
              <div className="font-medium truncate">{timer.title}</div>
              <div className="text-sm text-muted-foreground">
                Remaining: {formatTime(timer.remainingTime)} | Duration: {formatTime(timer.duration)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {timer.tags && timer.tags.length > 0 && (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {timer.tags[0]}
                {timer.tags.length > 1 && ` +${timer.tags.length - 1}`}
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {timer.status !== 'COMPLETED' && (
                  <DropdownMenuItem
                    onClick={() => {
                      markComplete(timer, setStatus);
                      workerRef.current?.postMessage({
                        type: 'STOP_TIMER'
                      });
                    }}
                  >
                    Mark Complete
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={handleViewDetails}>
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 