import * as React from 'react'
import { Plus, Calendar as CalendarIcon, Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, fetchAllTimers, markComplete } from "@/lib/utils"
import { format } from "date-fns"
import { Timer } from './timer'
import { TimerType } from '@/types'
import { useTimerStore } from '@/store/useTimerStore'

const timeOptions = [
  { value: '600', label: '10 minutes' },
]

export default function CountdownTimerDashboard() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null)
  // const { toast } = useToast();

 

  const {
    setAllTimers,
    setNewTimerTitle,
    setNewTimerDuration,
    setActiveFilter,
    addNewTimer,
    activeFilter,
    allTimers,
    newTimerTitle,
    newTimerDuration,
    setRemainingTime,
    setStatus,
  } = useTimerStore();

  React.useEffect(() => {
    fetchAllTimers(setAllTimers);
  }, [])



  const convertToISODate = (localDateString: string | undefined) => {
    if (!localDateString) return;
    const [month, day, year] = localDateString.split('/'); // Assuming the format is MM/DD/YYYY
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const addTimerDB = async (timer: TimerType | undefined) => {
    if (!timer) {
      console.error('Timer not found');
      return;
    }
    try {
      await fetch(`http://localhost:5000/api/timer`, {
        method: "POST",
        body: JSON.stringify({ ...timer }),
        headers: {
          "Content-Type": "application/json",
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  const addTimer = async (status: "ACTIVE" | "PAUSED" | "COMPLETED" = 'ACTIVE') => {
    const newTimer: TimerType = {
      id: uuidv4(),
      title: newTimerTitle,
      duration: 600,
      remainingTime: 600,
      status,
      createdAt: new Date().toISOString(),
      comments: [],
    }
    await addTimerDB(newTimer);
    addNewTimer(newTimer);
    setIsDialogOpen(false);
  }

  const workerRef = React.useRef<Worker | null>(null);

  React.useEffect(() => {
    if (!workerRef.current) {
      const workerUrl = new URL('../../timeWorker.js', import.meta.url);
      const worker = new Worker(workerUrl);
      workerRef.current = worker;
      workerRef.current.onmessage = event => {
        const { type, id, remainingTime } = event.data;

        switch (type) {
          case "TIMER_UPDATE":
            setRemainingTime(id, remainingTime);
            break;
          case "TIMER_COMPLETED":
            markComplete({ id, status: 'COMPLETED' }, setStatus);
            workerRef?.current?.postMessage({
              type: 'STOP_TIMER'
            });
            break;
          default:
            console.error('Unknown message type:', type);
        }
      }

      return () => {
        workerRef.current?.terminate();
        workerRef.current = null;
      };
    }
  }, [setRemainingTime, setStatus]);

  const getTimeSpent = (activeFilter: string) => {
    if (activeFilter === 'COMPLETED') {
      let seconds;
      const completedTimers = allTimers.filter(timer => timer.status === 'COMPLETED');
      if (selectedDate) {
        seconds = completedTimers.filter(timer => timer.completedAt?.split('T')[0] === convertToISODate(selectedDate?.toLocaleDateString())).reduce((acc, curr) => acc += curr.duration, 0);
      } else {
        seconds = completedTimers.reduce((acc, curr) => acc += curr.duration, 0);
      }
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hrs : ${minutes} min`
    } else if (activeFilter === 'ALL') {
      const seconds = allTimers.filter(timer => timer.status === 'COMPLETED').reduce((acc, curr) => acc += curr.duration, 0);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hrs : ${minutes} min`
    }
    return 0;
  }

  const filteredTimers = React.useMemo(() => {
    return allTimers.filter(timer => 
      timer.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [allTimers, searchQuery])

  const filteredByTagTimers = React.useMemo(() => {
    if (!selectedTag) return filteredTimers
    return filteredTimers.filter(timer => timer.tags?.includes(selectedTag))
  }, [filteredTimers, selectedTag])

  const uniqueTags = React.useMemo(() => {
    const tags = new Set<string>()
    allTimers.forEach(timer => {
      timer.tags?.forEach(tag => tag ? tags.add(tag) : '')
    })
    return Array.from(tags)
  }, [allTimers])

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <h1 className="text-2xl font-bold">Countdown Timers</h1>
          <div className="flex flex-wrap gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={allTimers.findIndex(timer => timer.status === 'ACTIVE') > -1}>
                  <Plus className="mr-2 h-4 w-4" /> Add Timer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Timer</DialogTitle>
                </DialogHeader>
                <form>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Label
                      </Label>
                      <Input
                        id="name"
                        value={newTimerTitle}
                        onChange={(e) => setNewTimerTitle(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="duration" className="text-right">
                        Duration
                      </Label>
                      <Select onValueChange={setNewTimerDuration} value={newTimerDuration}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className='w-full flex justify-end gap-2'>
                    <Button disabled={!newTimerTitle || !newTimerDuration} onClick={() => addTimer("ACTIVE")}>Start Now (Active)</Button>
                    <Button disabled={!newTimerTitle || !newTimerDuration} onClick={() => addTimer("PAUSED")}> Start Later (Queued)</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search timers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeFilter === 'ALL' ? "secondary" : "outline"}
              onClick={() => {
                setActiveFilter('ALL')
                setSelectedTag(null)
              }}
            >
              All
            </Button>
            <Button
              variant={activeFilter === 'ACTIVE' ? "secondary" : "outline"}
              onClick={() => {
                setActiveFilter('ACTIVE')
                setSelectedTag(null)
              }}
            >
              Active (In progress)
            </Button>
            <Button
              variant={activeFilter === 'QUEUED' ? "secondary" : "outline"}
              onClick={() => {
                setActiveFilter('QUEUED')
                setSelectedTag(null)
              }}
            >
              Queued
            </Button>
            <Button
              variant={activeFilter === 'COMPLETED' ? "secondary" : "outline"}
              onClick={() => {
                setActiveFilter('COMPLETED')
                setSelectedTag(null)
              }}
            >
              Completed
            </Button>
          </div>

          {uniqueTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {uniqueTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className="h-7"
                >
                  {tag}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {selectedTag ? `${activeFilter} Timers - ${selectedTag}` : `${activeFilter} Timers`}
          </h2>
          <h2 className="text-xl font-semibold">Time Spent: {getTimeSpent(activeFilter)}</h2>
          <span className="text-sm font-medium">
            Count: {filteredByTagTimers.length}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {!selectedDate && activeFilter === 'ALL' && 
            filteredByTagTimers.map(timer => (
              <Timer key={timer.id} timer={timer} workerRef={workerRef} />
            ))
          }
          {!selectedDate && activeFilter === 'COMPLETED' && 
            filteredByTagTimers
              .filter(timer => ['COMPLETED'].includes(timer.status))
              .map(timer => (
                <Timer key={timer.id} timer={timer} workerRef={workerRef} />
              ))
          }
          {!selectedDate && activeFilter === 'QUEUED' && 
            filteredByTagTimers
              .filter(timer => ['PAUSED'].includes(timer.status))
              .map(timer => (
                <Timer key={timer.id} timer={timer} workerRef={workerRef} />
              ))
          }
          {activeFilter === 'ACTIVE' && 
            filteredByTagTimers
              .filter(timer => ['ACTIVE'].includes(timer.status))
              .map(timer => (
                <Timer key={timer.id} timer={timer} workerRef={workerRef} />
              ))
          }
          {selectedDate && activeFilter === 'COMPLETED' && 
            filteredByTagTimers
              .filter(timer => 
                timer.completedAt?.split('T')[0] === convertToISODate(selectedDate.toLocaleDateString())
              )
              .filter(timer => ['COMPLETED'].includes(timer.status))
              .map(timer => (
                <Timer key={timer.id} timer={timer} workerRef={workerRef} />
              ))
          }
          {selectedDate && activeFilter === 'QUEUED' && 
            filteredByTagTimers
              .filter(timer => 
                timer.createdAt.split('T')[0] === convertToISODate(selectedDate.toLocaleDateString())
              )
              .filter(timer => ['PAUSED'].includes(timer.status))
              .map(timer => (
                <Timer key={timer.id} timer={timer} workerRef={workerRef} />
              ))
          }
        </div>
      </div>
    </div>
  )
}