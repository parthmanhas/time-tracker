import * as React from 'react'
import { Clock, Plus, Pause, Play, Tag, CheckCircle, Calendar as CalendarIcon, Edit2, X, MessageSquare } from 'lucide-react'
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
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Timer } from './timer'
import { TimerType } from '@/types'

const timeOptions = [
  { value: '1', label: '1 seconds' },
  { value: '3', label: '3 seconds' },
  { value: '10', label: '10 seconds' },
  { value: '120', label: '2 minutes' },
  { value: '600', label: '10 minutes' },
  { value: '1200', label: '20 minutes' },
  { value: '1800', label: '30 minutes' },
  { value: '2400', label: '40 minutes' },
  { value: '2700', label: '45 minutes' },
]

export default function CountdownTimerDashboard() {
  const [timers, setTimers] = React.useState<TimerType[]>([])
  const [activeFilterName, setActiveFilterName] = React.useState('ALL')
  const [newTimerLabel, setNewTimerLabel] = React.useState('')
  const [newTimerDuration, setNewTimerDuration] = React.useState('')
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)
  const { toast } = useToast();

  React.useEffect(() => {
    fetchAllTimers();
  }, [])

  const fetchAllTimers = async () => {
    const response = await fetch("http://localhost:5000/api/timers");
    const dbTimers = await response.json() as TimerType[];
    const timersWithoutCommentsAndTags = dbTimers.map(timer => {
      const { comments, tags, ...t } = timer;
      if (t.status === 'ACTIVE')
        t.status = "PAUSED";
      return t;
    }).sort((a, b) => {
      const order = { 'PAUSED': 0, 'ACTIVE': 0, 'COMPLETED': 1 };
      return order[a.status] - order[b.status];
    })
    //should be atmost one active timer, active timer stays local until completed or paused
    const activeTimer = timers.filter(timer => timer.status === 'ACTIVE');
    if(activeTimer.length > 1) {
      console.error('Cannot be 2 active timers, foucs man!');
      setTimers([])
      return;
    }
    const activeTimerId = activeTimer[0]?.id;
    setTimers([...timers.filter(timer => timer.id === activeTimerId), ...timersWithoutCommentsAndTags.filter(timer => timer.id !== activeTimerId)]);
  }

  const addTimerDB = async (timer: TimerType | undefined) => {
    if (!timer) {
        console.error('Timer not found');
        return;
    }
    const { comments, tags, ...timersWithoutCommentsAndTags } = timer;
    // console.log(timersWithoutCommentsAndTags)
    try {
        await fetch(`http://localhost:5000/api/timers/${timer.id}`, {
            method: "POST",
            body: JSON.stringify({ ...timersWithoutCommentsAndTags }), // change label to timer everywhere
            headers: {
                "Content-Type": "application/json",
            }
        });
    } catch (e) {
        console.error(e);
    }
}

  const addTimer = async (status: "ACTIVE" | "PAUSED" | "COMPLETED" = 'ACTIVE') => {
    if (newTimerLabel.trim() === '' || newTimerDuration === '') return

    const newTimer: TimerType = {
      id: uuidv4(),
      title: newTimerLabel,
      duration: parseInt(newTimerDuration),
      remainingTime: parseInt(newTimerDuration),
      tags: ['unfinished'],
      status,
      createdAt: new Date().toISOString(),
      comments: [],
    }
    await addTimerDB(newTimer);
    setTimers([...timers, newTimer])
    setNewTimerLabel('')
    setNewTimerDuration('')
    setIsDialogOpen(false)
  }

  const sync = async () => {
    console.log(timers);
    return

    const timersWithoutCommentsAndTags = timers.map(timer => {
      const { comments, tags, ...t } = timer;
      // change label to title 
      return { ...t };
    })
    console.log(timersWithoutCommentsAndTags)
    try {
      await fetch("http://localhost:5000/api/timers", {
        method: "POST",
        body: JSON.stringify({ timers: timersWithoutCommentsAndTags }),
        headers: {
          "Content-Type": "application/json",
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  const updateTimerState = (timer: TimerType) => {
    setTimers([...timers.filter(t => t.id !== timer.id), timer]);
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
                <Button disabled={timers.findIndex(timer => timer.status === 'ACTIVE') > -1}>
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
                        value={newTimerLabel}
                        onChange={(e) => setNewTimerLabel(e.target.value)}
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
                  <Button onClick={() => addTimer()}>Start Timer Now (Active)</Button>
                  <Button onClick={() => addTimer("PAUSED")}> Start Later (Not Started)</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={sync}>Sync</Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={activeFilterName === 'ALL' ? "secondary" : "outline"}
            onClick={() => {
              setActiveFilterName('ALL')
              fetchAllTimers()
            }}
          >
            All
          </Button>
          <Button
            variant={activeFilterName === 'ACTIVE' ? "secondary" : "outline"}
            onClick={() => {
              setActiveFilterName('ACTIVE')
            }}
          >
            Active (In progress)
          </Button>
          <Button
            variant={activeFilterName === 'STARTED' ? "secondary" : "outline"}
            onClick={() => {
              setActiveFilterName('STARTED')
            }}
          >
            Started
          </Button>
          <Button
            variant={activeFilterName === 'NOT_STARTED' ? "secondary" : "outline"}
            onClick={() => {
              setActiveFilterName('NOT_STARTED')
            }}
          >
            Not Started
          </Button>
          <Button
            variant={activeFilterName === 'COMPLETED' ? "secondary" : "outline"}
            onClick={() => {
              setActiveFilterName('COMPLETED')
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
          <h2 className="text-xl font-semibold">{activeFilterName} Timers</h2>
          <span className="text-sm font-medium">Count: {timers.length}</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeFilterName === 'ALL' && timers.map(timer => (<Timer key={timer.id} updateTimerState={updateTimerState} timer={timer} />))}
          {activeFilterName === 'COMPLETED' && timers.filter(timer => ['COMPLETED'].includes(timer.status)).map(timer => (<Timer key={timer.id} updateTimerState={updateTimerState} timer={timer} />))}
          {activeFilterName === 'NOT_STARTED' && timers.filter(timer => Math.abs(timer.duration - timer.remainingTime) === 0 && !['COMPLETED'].includes(timer.status)).map(timer => (<Timer key={timer.id} updateTimerState={updateTimerState} timer={timer} />))}
          {activeFilterName === 'STARTED' && timers.filter(timer => Math.abs(timer.duration - timer.remainingTime) > 0 && timer.status !== 'COMPLETED').map(timer => (<Timer key={timer.id} updateTimerState={updateTimerState} timer={timer} />))}
          {activeFilterName === 'ACTIVE' && timers.filter(timer => ['ACTIVE'].includes(timer.status)).map(timer => (<Timer key={timer.id} updateTimerState={updateTimerState} timer={timer} />))}
        </div>
      </div>
    </div >
  )
}