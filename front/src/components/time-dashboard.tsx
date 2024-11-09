import * as React from 'react'
import { Clock, Plus, Pause, Play, Tag, CheckCircle, Calendar as CalendarIcon, Edit2, X, MessageSquare } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

type Timer = {
  id: number
  label: string
  duration: number
  remainingTime: number
  tags: string[]
  status: "ACTIVE" | "PAUSED" | "FINISHED",
  createdAt: string
  completedAt?: string
  comments: string[]
}

const timeOptions = [
  { value: '10', label: '10 seconds' },
  { value: '600', label: '10 minutes' },
  { value: '1200', label: '20 minutes' },
  { value: '1800', label: '30 minutes' },
  { value: '2400', label: '40 minutes' },
  { value: '2700', label: '45 minutes' },
]

// Mock function to simulate saving to Postgres
const saveToDatabase = async (timers: Timer[], allTags: string[]) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  console.log('Saved to database:', { timers, allTags })
  return true
}

export default function CountdownTimerDashboard() {
  const [timers, setTimers] = React.useState<Timer[]>([])
  const [nextTimerId, setNextTimerId] = React.useState(1)
  const [newTimerLabel, setNewTimerLabel] = React.useState('')
  const [newTimerDuration, setNewTimerDuration] = React.useState('')
  const [newTag, setNewTag] = React.useState('')
  const [allTags, setAllTags] = React.useState<string[]>(['finished', 'unfinished'])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)
  const [editingTimerId, setEditingTimerId] = React.useState<number | null>(null)
  const [editedLabel, setEditedLabel] = React.useState('')
  const [newComment, setNewComment] = React.useState('')
  const { toast } = useToast();
  const [loadingFromLocalStorage, setLoadingFromLocalStorage] = React.useState(true)

  // Load timers and tags from localStorage on initial render
  React.useEffect(() => {
    const savedTimers = localStorage.getItem('timers')
    const savedNextTimerId = localStorage.getItem('nextTimerId')
    const savedAllTags = localStorage.getItem('allTags')

    if (savedTimers) {
      setTimers(JSON.parse(savedTimers))
    }
    if (savedNextTimerId) {
      setNextTimerId(parseInt(savedNextTimerId))
    }
    if (savedAllTags) {
      setAllTags(JSON.parse(savedAllTags))
    }
    setLoadingFromLocalStorage(false)
  }, [])

  // Save timers and tags to localStorage and database whenever they change
  // React.useEffect(() => {
  //   if (loadingFromLocalStorage) return;
  //   localStorage.setItem('timers', JSON.stringify(timers))
  //   localStorage.setItem('nextTimerId', nextTimerId.toString())
  //   localStorage.setItem('allTags', JSON.stringify(allTags))

  //   // Save to database
  //   saveToDatabase(timers, allTags)
  //     .then(() => console.log('Saved to database successfully'))
  //     .catch(error => console.error('Failed to save to database:', error))
  // }, [timers, nextTimerId, allTags, loadingFromLocalStorage])

  const addTimer = () => {
    if (newTimerLabel.trim() === '' || newTimerDuration === '') return

    const newTimer: Timer = {
      id: nextTimerId,
      label: newTimerLabel,
      duration: parseInt(newTimerDuration),
      remainingTime: parseInt(newTimerDuration),
      tags: ['unfinished'],
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      comments: [],
    }
    setTimers([...timers, newTimer])
    setNextTimerId(nextTimerId + 1)
    setNewTimerLabel('')
    setNewTimerDuration('')
    setIsDialogOpen(false)
  }

  const toggleTimer = (id: number) => {
    setTimers(timers.map(timer => {
      if (timer.id === id) {
        const currentStatus = timer.status;
        const toggledStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        return { ...timer, status: toggledStatus }
      }
      return timer
    }))
  }

  const addTag = (timerId: number, tag: string) => {
    if (tag.trim() === '') return

    setTimers(timers.map(timer => {
      if (timer.id === timerId) {
        let newTags = [...timer.tags]
        if (tag === 'finished') {
          newTags = newTags.filter(t => t !== 'unfinished')
          if (!newTags.includes('finished')) {
            newTags.push('finished')
          }
        } else if (tag === 'unfinished') {
          if (timer.status === 'ACTIVE') {
            newTags = newTags.filter(t => t !== 'finished')
            if (!newTags.includes('unfinished')) {
              newTags.push('unfinished')
            }
          }
        } else if (!newTags.includes(tag)) {
          newTags.push(tag)
        }
        return { ...timer, tags: newTags }
      }
      return timer
    }))

    if (!allTags.includes(tag)) {
      setAllTags([...allTags, tag])
    }

    setNewTag('')
  }

  const removeTag = (timerId: number, tagToRemove: string) => {
    setTimers(timers.map(timer => {
      if (timer.id === timerId) {
        return { ...timer, tags: timer.tags.filter(tag => tag !== tagToRemove) }
      }
      return timer
    }))

    // Remove tag from allTags if it's not used by any timer
    const isTagUsed = timers.some(timer => timer.tags.includes(tagToRemove))
    if (!isTagUsed && tagToRemove !== 'finished' && tagToRemove !== 'unfinished') {
      setAllTags(allTags.filter(tag => tag !== tagToRemove))
    }
  }

  const editTimerLabel = (id: number) => {
    setTimers(timers.map(timer => {
      if (timer.id === id) {
        return { ...timer, label: editedLabel }
      }
      return timer
    }))
    setEditingTimerId(null)
    setEditedLabel('')
  }

  const addComment = (timerId: number, comment: string) => {
    if (comment.trim() === '') return

    setTimers(timers.map(timer => {
      if (timer.id === timerId) {
        return { ...timer, comments: [...timer.comments, comment] }
      }
      return timer
    }))
    setNewComment('')
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setTimers(prevTimers => prevTimers.map(timer => {
        if (timer.status === 'ACTIVE' && timer.remainingTime > 0) {
          const newRemainingTime = timer.remainingTime - 1
          if (newRemainingTime === 0) {
            toast({
              title: "Timer Finished",
              description: `${timer.label} has reached zero!`,
            })
            return {
              ...timer,
              remainingTime: newRemainingTime,
              status: 'FINISHED',
              tags: timer.tags.filter(tag => tag !== 'unfinished').concat('finished'),
              completedAt: now.toISOString()
            }
          }
          return { ...timer, remainingTime: newRemainingTime }
        }
        // Check if the timer is unfinished and the day has changed
        if (['ACTIVE', 'PAUSED'].includes(timer.status) && new Date(timer.createdAt).getDate() !== now.getDate()) {
          return {
            ...timer,
            tags: timer.tags.includes('unfinished') ? timer.tags : [...timer.tags, 'unfinished']
          }
        }
        return timer
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filterTimersByDate = (timer: Timer) => {
    if (!selectedDate) return true
    const timerDate = new Date(timer.createdAt)
    return timerDate.toDateString() === selectedDate.toDateString()
  }

  const sync = async () => {
    console.log(timers)
    try {
      await fetch("http://localhost:5000/api/timers", {
        method: "POST",
        body: JSON.stringify({ timers }),
        headers: {
          "Content-Type": "application/json",
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  const activeTimers = timers.filter(timer => ['ACTIVE'].includes(timer.status) && filterTimersByDate(timer))
  const finishedTimers = timers.filter(timer => ['FINISHED'].includes(timer.status) && filterTimersByDate(timer))

  const filteredActiveTimers = selectedTag
    ? activeTimers.filter(timer => timer.tags.includes(selectedTag))
    : activeTimers

  const filteredFinishedTimers = selectedTag
    ? finishedTimers.filter(timer => timer.tags.includes(selectedTag))
    : finishedTimers

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
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Timer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Timer</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  addTimer()
                }}>
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
                  <Button type="submit">Add Timer</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button onClick={sync}>Sync</Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={selectedTag === null ? "secondary" : "outline"}
            onClick={() => setSelectedTag(null)}
          >
            All
          </Button>
          {allTags.map(tag => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "secondary" : "outline"}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Active Timers</h2>
          <span className="text-sm font-medium">Count: {filteredActiveTimers.length}</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredActiveTimers.map(timer => (
            <Card key={timer.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  {editingTimerId === timer.id ? (
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      editTimerLabel(timer.id)
                    }} className="flex-grow mr-2">
                      <Input
                        value={editedLabel}
                        onChange={(e) => setEditedLabel(e.target.value)}
                        className="text-lg font-semibold"
                      />
                    </form>
                  ) : (
                    <span className="text-lg font-semibold">{timer.label}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (editingTimerId === timer.id) {
                        editTimerLabel(timer.id)
                      } else {
                        setEditingTimerId(timer.id)
                        setEditedLabel(timer.label)
                      }
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-3xl font-bold mb-4">
                  {formatTime(timer.remainingTime)}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  Created: {formatDate(timer.createdAt)}
                </div>
                <div className="flex space-x-2 mb-4">
                  <Button onClick={() => toggleTimer(timer.id)} className="flex-grow">
                    {timer.status === 'ACTIVE' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {timer.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Tag className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <div className="p-2">
                        <form onSubmit={(e) => {
                          e.preventDefault()
                          addTag(timer.id, newTag)
                        }}>
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add new tag"
                          />
                        </form>
                      </div>
                      {allTags.filter(tag => !['finished', 'unfinished'].includes(tag)).map(tag => (
                        <DropdownMenuItem key={tag} onSelect={() => addTag(timer.id, tag)}>
                          {tag}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {timer.tags.map(tag => (
                    <div key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm flex items-center">
                      {tag}
                      {!['finished', 'unfinished'].includes(tag) && <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 p-0 h-4 w-4"
                        onClick={() => removeTag(timer.id, tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>}
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">Comments</h3>
                  {timer.comments.map((comment, index) => (
                    <div key={index} className="text-sm mb-1">{comment}</div>
                  ))}
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    addComment(timer.id, newComment)
                  }} className="mt-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment"
                      className="mb-2"
                    />
                    <Button type="submit" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Add Comment
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center mt-8">
          <h2 className="text-xl font-semibold">Finished Timers</h2>
          <span className="text-sm font-medium">Count: {filteredFinishedTimers.length}</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFinishedTimers.map(timer => (
            <Card key={timer.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  {editingTimerId === timer.id ? (
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      editTimerLabel(timer.id)
                    }} className="flex-grow mr-2">
                      <Input
                        value={editedLabel}
                        onChange={(e) => setEditedLabel(e.target.value)}
                        className="text-lg font-semibold"
                      />
                    </form>
                  ) : (
                    <span className="text-lg font-semibold">{timer.label}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (editingTimerId === timer.id) {
                        editTimerLabel(timer.id)
                      } else {
                        setEditingTimerId(timer.id)
                        setEditedLabel(timer.label)
                      }
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold mb-4">
                  {formatTime(timer.duration)}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  Created: {formatDate(timer.createdAt)}
                </div>
                {timer.completedAt && (
                  <div className="text-sm text-muted-foreground mb-2">
                    Completed: {formatDate(timer.completedAt)}
                  </div>
                )}
                <div className="flex space-x-2 mb-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Tag className="h-4 w-4 mr-2" /> Add Tag
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <div className="p-2">
                        <form onSubmit={(e) => {
                          e.preventDefault()
                          addTag(timer.id, newTag)
                        }}>
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add new tag"
                          />
                        </form>
                      </div>
                      {allTags.filter(tag => !['unfinished'].includes(tag)).map(tag => (
                        <DropdownMenuItem
                          key={tag}
                          onSelect={() => addTag(timer.id, tag)}
                          disabled={tag === 'unfinished'}
                        >
                          {tag}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {timer.tags.map(tag => (
                    <div key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm flex items-center">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 p-0 h-4 w-4"
                        onClick={() => removeTag(timer.id, tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">Comments</h3>
                  {timer.comments.map((comment, index) => (
                    <div key={index} className="text-sm mb-1">{comment}</div>
                  ))}
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    addComment(timer.id, newComment)
                  }} className="mt-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment"
                      className="mb-2"
                    />
                    <Button type="submit" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Add Comment
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}