import * as React from 'react'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
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
import { cn } from "@/lib/utils"
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
  // const { toast } = useToast();

  React.useEffect(() => {
    fetchAllTimers();
  }, [])

  const {
    setAllTimers,
    setNewTimerTitle,
    setNewTimerDuration,
    setActiveFilter,
    addNewTimer,
    activeFilter,
    allTimers,
    newTimerTitle,
    newTimerDuration
  } = useTimerStore();

  const fetchAllTimers = async () => {
    const response = await fetch("http://localhost:5000/api/timers");
    let dbTimers = await response.json() as TimerType[];
    dbTimers = dbTimers.map(timer => ({
      ...timer,
      status: timer.status === 'ACTIVE' ? 'PAUSED' : timer.status
    }))
    setAllTimers(dbTimers);
    //should be atmost one active timer, active timer stays local until completed or paused
  }

  const addTimerDB = async (timer: TimerType | undefined) => {
    if (!timer) {
      console.error('Timer not found');
      return;
    }
    try {
      await fetch(`http://localhost:5000/api/timers/${timer.id}`, {
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

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Countdown Timers</h1>
          <div className="flex space-x-2">
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
                <div>
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
                    <Button onClick={() => addTimer("ACTIVE")}>Start Now (Active)</Button>
                    <Button onClick={() => addTimer("PAUSED")}> Start Later (Queued)</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={activeFilter === 'ALL' ? "secondary" : "outline"}
            onClick={() => {
              setActiveFilter('ALL')
            }}
          >
            All
          </Button>
          <Button
            variant={activeFilter === 'ACTIVE' ? "secondary" : "outline"}
            onClick={() => {
              setActiveFilter('ACTIVE')
            }}
          >
            Active (In progress)
          </Button>
          <Button
            variant={activeFilter === 'QUEUED' ? "secondary" : "outline"}
            onClick={() => {
              setActiveFilter('QUEUED')
            }}
          >
            Queued
          </Button>
          <Button
            variant={activeFilter === 'COMPLETED' ? "secondary" : "outline"}
            onClick={() => {
              setActiveFilter('COMPLETED')
            }}
          >
            Completed
          </Button>
          {/* {allTags.map(tag => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "secondary" : "outline"}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </Button>
          ))} */}
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{activeFilter} Timers</h2>
          <span className="text-sm font-medium">Count: {allTimers.length}</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeFilter === 'ALL' && allTimers.map(timer => (<Timer key={timer.id} timer={timer} />))}
          {activeFilter === 'COMPLETED' && allTimers.filter(timer => ['COMPLETED'].includes(timer.status)).map(timer => (<Timer key={timer.id} timer={timer} />))}
          {activeFilter === 'QUEUED' && allTimers.filter(timer => ['PAUSED'].includes(timer.status)).map(timer => (<Timer key={timer.id} timer={timer} />))}
          {activeFilter === 'ACTIVE' && allTimers.filter(timer => ['ACTIVE'].includes(timer.status)).map(timer => (<Timer key={timer.id} timer={timer} />))}
        </div>
      </div>
    </div >
  )
}