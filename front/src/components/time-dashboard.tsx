import * as React from 'react'
import { Plus, Search, LayoutGrid, List, CirclePlusIcon, Clock, Play } from 'lucide-react'
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
import { cn, fetchAllTimers, markComplete } from "@/lib/utils"
import { Timer } from './timer'
import { TimerType } from '@/types'
import { ActiveFilter, useTimerStore } from '@/store/useTimerStore'
import { Badge } from "@/components/ui/badge"
import { API } from '@/config/api'
import { WithLoading } from '@/hoc/hoc'
import { soundManager } from '@/lib/sound'
import { useAuth } from '@/context/AuthContext'
import { toast } from '@/hooks/use-toast'
import { CompactTimer } from "./timer-compact"
import { WithSidebarTrigger } from './WithSidebarTrigger'
import DashboardHeader from './dashboard-header'
import { isSameDay } from 'date-fns'

const timeOptions = [
  { value: '600', label: '10 minutes' },
  { value: '1200', label: '20 minutes' },
  { value: '1800', label: '30 minutes' },
  { value: '3600', label: '60 minutes' },
]

export default function CountdownTimerDashboard() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null)
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [newTag, setNewTag] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(true);
  const [sortBy, setSortBy] = React.useState<'created' | 'duration' | 'remaining'>('created')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc')
  const [view, setView] = React.useState<'grid' | 'list'>('grid')

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

  const { logout } = useAuth();

  React.useEffect(() => {
    fetchAllTimers(setAllTimers, logout, setIsLoading);
  }, [])

  const addTimerDB = async (timer: TimerType | undefined) => {
    if (!timer) {
      console.error('Timer not found');
      return;
    }
    try {
      await fetch(API.getUrl('TIMER'), {
        method: "POST",
        credentials: 'include',
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
    setIsLoading(true);
    const newTimer: TimerType = {
      id: uuidv4(),
      title: newTimerTitle,
      duration: parseInt(newTimerDuration),
      remainingTime: parseInt(newTimerDuration),
      status,
      createdAt: new Date().toISOString(),
      comments: [],
      tags: selectedTags,
    }
    await addTimerDB(newTimer);
    addNewTimer(newTimer);
    setIsDialogOpen(false);
    setSelectedTags([]);
    setIsLoading(false);
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
          case "TIMER_STARTED":
            toast({
              title: 'Timer Started',
              description: `Timer has been started.`,
            });
            break;
          case "TIMER_UPDATE":
            setRemainingTime(id, remainingTime);
            break;
          case "TIMER_COMPLETED":
            markComplete({ id, status: 'COMPLETED' }, setStatus, setIsLoading);
            soundManager.playTimerComplete();
            workerRef?.current?.postMessage({
              type: 'STOP_TIMER'
            });
            toast({
              title: 'Timer Completed',
              description: `Timer has been completed.`,
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
      const completedTimers = allTimers.filter(timer => timer.status === 'COMPLETED' && timer.completedAt && isSameDay(new Date(timer.completedAt), new Date()));
      const seconds = completedTimers.filter(timer => timer.completedAt === new Date().toISOString()).reduce((acc, curr) => acc += curr.duration, 0);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hrs : ${minutes} min`
    } else if (activeFilter === 'ALL') {
      const seconds = allTimers.filter(timer => timer.status === 'COMPLETED').reduce((acc, curr) => acc += curr.duration, 0);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hrs : ${minutes} min`
    }
    return '0';
  }

  const getTotalTimeRemaining = React.useCallback(() => {
    const queuedTimers = allTimers.filter(timer => timer.status === 'PAUSED');
    const totalSeconds = queuedTimers.reduce((acc, curr) => acc + curr.remainingTime, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours} hrs : ${minutes} min`;
  }, [allTimers]);

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
    allTimers?.forEach(timer => {
      if (timer.tags) {
        timer.tags.forEach(tag => {
          if (tag) tags.add(tag)
        })
      }
      selectedTags.forEach(tag => {
        if (tag) tags.add(tag)
      })
    })
    return Array.from(tags)
  }, [allTimers, selectedTags]) || []

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => {
      const prevTags = prev || []
      setNewTag('')
      if (prevTags.includes(tag)) {
        return prevTags.filter(t => t !== tag)
      }
      return [...prevTags, tag]
    })
  }

  const sortTimers = (timers: TimerType[]) => {
    return [...timers].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'created':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'duration':
          comparison = b.duration - a.duration;
          break;
        case 'remaining':
          comparison = b.remainingTime - a.remainingTime;
          break;
      }

      return sortOrder === 'desc' ? comparison : -comparison;
    });
  };

  const sortedAndFilteredTimers = React.useMemo(() => {
    return sortTimers(filteredByTagTimers);
  }, [filteredByTagTimers, sortBy, sortOrder]);

  React.useEffect(() => {
    const handleSwitchView = () => {
      setView('grid');
    };

    window.addEventListener('switchToGridView', handleSwitchView);
    return () => window.removeEventListener('switchToGridView', handleSwitchView);
  }, []);
  

  return (
    <div className="container mx-auto p-6">
      <WithLoading isLoading={isLoading} size={80} isScreen={true}>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <WithSidebarTrigger>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Countdown Timers</h1>
                  <p className="text-sm text-slate-500">Manage and track your time effectively</p>
                </div>
              </div>
            </WithSidebarTrigger>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-sm" 
                  disabled={allTimers.findIndex(timer => timer.status === 'ACTIVE') > -1}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Timer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] p-0">
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CirclePlusIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    Add New Timer
                  </DialogTitle>
                </DialogHeader>
                <div className="p-6 space-y-6">
                  {/* Timer Details Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                        Timer Label
                      </Label>
                      <Input
                        id="name"
                        value={newTimerTitle}
                        onChange={(e) => setNewTimerTitle(e.target.value)}
                        className="border-slate-200 focus:border-purple-200 focus:ring-purple-200"
                        placeholder="Enter timer name..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-sm font-medium text-slate-700">
                        Duration
                      </Label>
                      <Select onValueChange={setNewTimerDuration} value={newTimerDuration}>
                        <SelectTrigger className="w-full border-slate-200 focus:border-purple-200 focus:ring-purple-200">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(option => (
                            <SelectItem 
                              key={option.value} 
                              value={option.value}
                              className="focus:bg-purple-50"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Tags Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">
                      Tags
                    </Label>
                    {uniqueTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        {uniqueTags.map(tag => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            className={cn(
                              "cursor-pointer transition-all",
                              selectedTags.includes(tag) 
                                ? "bg-purple-100 text-purple-700 hover:bg-purple-200" 
                                : "hover:border-purple-200"
                            )}
                            onClick={() => handleTagSelect(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add new tag" 
                        value={newTag} 
                        onChange={(e) => setNewTag(e.target.value)}
                        className="border-slate-200 focus:border-purple-200 focus:ring-purple-200"
                      />
                      <Button 
                        onClick={() => handleTagSelect(newTag)}
                        variant="outline"
                        className="border-slate-200 hover:bg-purple-50 hover:text-purple-600"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <WithLoading isLoading={isLoading} addingTimer={true}>
                      <Button 
                        disabled={selectedTags.length === 0 || !newTimerTitle || !newTimerDuration} 
                        onClick={() => addTimer("ACTIVE")}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                      >
                        <Play className="mr-2 h-4 w-4" /> Start Now (Active)
                      </Button>
                      <Button 
                        disabled={selectedTags.length === 0 || !newTimerTitle || !newTimerDuration} 
                        onClick={() => addTimer("PAUSED")}
                        variant="outline"
                        className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <Clock className="mr-2 h-4 w-4" /> Start Later (Queued)
                      </Button>
                    </WithLoading>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters Section */}
          <div className="space-y-4 bg-white p-4 rounded-lg border shadow-sm">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search timers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 border-slate-200 focus:border-purple-200 focus:ring-purple-200"
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {['ALL', 'ACTIVE', 'QUEUED', 'COMPLETED'].map((filter) => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? "secondary" : "outline"}
                    onClick={() => {
                      setActiveFilter(filter as ActiveFilter)
                      setSelectedTag(null)
                    }}
                    className={cn(
                      "transition-all",
                      activeFilter === filter && "bg-purple-100 text-purple-700 border-purple-200"
                    )}
                  >
                    {filter === 'ALL' ? 'All' : 
                     filter === 'ACTIVE' ? 'Active (In progress)' :
                     filter === 'QUEUED' ? 'Queued' : 'Completed'}
                  </Button>
                ))}
              </div>

              {uniqueTags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-700">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {uniqueTags.map(tag => (
                      <Button
                        key={tag}
                        variant={selectedTag === tag ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                        className={cn(
                          "h-7",
                          selectedTag === tag && "bg-purple-100 text-purple-700 border-purple-200"
                        )}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Header */}
          <DashboardHeader 
            selectedTag={selectedTag} 
            activeFilter={activeFilter} 
            getTimeSpent={getTimeSpent} 
            filteredByTagTimers={filteredByTagTimers}
            getTotalTimeRemaining={getTotalTimeRemaining}
          />

          {/* Controls Section */}
          <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium text-slate-600 w-16">Sort by:</span>
                <Select value={sortBy} onValueChange={(value: 'created' | 'duration' | 'remaining') => setSortBy(value)}>
                  <SelectTrigger className="flex-1 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created">Creation Date</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="remaining">Remaining Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium text-slate-600 w-16">Order:</span>
                <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                  <SelectTrigger className="flex-1 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg">
                <Button
                  variant={view === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setView('grid')}
                  className={cn(view === 'grid' && "bg-white shadow-sm")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setView('list')}
                  className={cn(view === 'list' && "bg-white shadow-sm")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Timers Grid/List */}
          <div className={cn(
            "gap-4",
            view === 'grid'
              ? "grid md:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col"
          )}>
            {sortedAndFilteredTimers
              .filter(timer => {
              switch (activeFilter) {
                case 'ALL':
                return true;
                case 'COMPLETED':
                return timer.status === 'COMPLETED';
                case 'QUEUED':
                return timer.status === 'PAUSED';
                case 'ACTIVE':
                return timer.status === 'ACTIVE';
                default:
                return false;
              }
              })
              .map(timer => (
              view === 'grid' ? (
                <Timer key={timer.id} timer={timer} workerRef={workerRef} />
              ) : (
                <CompactTimer key={timer.id} timer={timer} workerRef={workerRef} />
              )
              ))
            }
          </div>
        </div>
      </WithLoading>
    </div>
  )
}