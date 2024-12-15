import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@radix-ui/react-dropdown-menu"
import { Pause, Play, Tag, MessageSquare, CheckCircle } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Button } from './ui/button'
import React from "react"
import { TimerType } from "@/types"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { useTimerStore } from "@/store/useTimerStore"
import { markComplete } from "@/lib/utils"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { API } from '@/config/api'

type TimerProps = {
    timer: TimerType,
    workerRef: React.MutableRefObject<Worker | null>
}

export function Timer({ timer, workerRef }: TimerProps) {
    const {
        setStatus,
        addComment,
        addTag,
        setRemainingTime,
        allTimers,
        setDuration
    } = useTimerStore();

    const [newTag, setNewTag] = React.useState('');
    const [newComment, setNewComment] = React.useState('');
    const [isCommentsOpen, setIsCommentsOpen] = React.useState(false);

    React.useEffect(() => {
        if (timer.status === 'COMPLETED') {
            return;
        } else if (timer.status === 'ACTIVE') {
            workerRef?.current?.postMessage({
                type: "START_TIMER",
                payload: { id: timer.id, remainingTime: timer.remainingTime },
            });
        }

    }, [setRemainingTime, timer.duration, timer.id, timer.remainingTime, timer.status, workerRef]);

    const completeAt = Date.now() + Math.abs(timer.remainingTime) * 1000;

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

    const toggleTimer = async () => {
        setStatus(timer.id, timer.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE');
        workerRef.current?.postMessage({
            type: timer.status === 'ACTIVE' ? 'STOP_TIMER' : 'START_TIMER',
            payload: { id: timer.id, remainingTime: timer.remainingTime },
        });
        updateTimerDB({ ...timer, status: timer.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' });
    }

    const updateTimerDB = async (timer: TimerType | undefined) => {
        if (!timer) {
            console.error('Timer not found');
            return;
        }
        try {
            await fetch(API.getUrl('TIMER'), {
                method: "PATCH",
                body: JSON.stringify({ ...timer, due_at: new Date(completeAt) }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
        } catch (e) {
            console.error(e);
        }
    }

    const addTagDB = async (timerId: string, tag: string) => {
        if (!timerId || !tag) {
            console.error('Missing required parameters');
            return;
        }
        try {
            await fetch(API.getUrl('ADD_TAG'), {
                method: 'POST',
                body: JSON.stringify({ id: timerId, tag }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        } catch (e) {
            console.error(e);
        }
    }

    const addCommentDB = async (timerId: string, comment: string) => {
        try {
            await fetch(API.getUrl('COMMENT'), {
                method: 'POST',
                body: JSON.stringify({ id: timerId, comment }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        } catch (e) {
            console.error(e);
        }
    }

    const addTime = async () => {
        setDuration(timer.id, timer.duration + 600);
        setStatus(timer.id, 'ACTIVE');
        setRemainingTime(timer.id, 600);
        try {
            await fetch('http://localhost:5000/api/timer', {
                method: 'PATCH',
                body: JSON.stringify({ id: timer.id, duration: timer.duration + 600, status: timer.status }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <Card key={timer.id}>
            <CardContent className="p-4 flex flex-col justify-between h-full">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            {<span className="text-lg font-semibold">{timer.title}</span>}
                        </div>
                        <div className="flex h-full items-start">
                            {timer.status === 'COMPLETED' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="flex w-full justify-between font-semibold">
                            Duration
                            <p>{formatTime(timer.duration)}</p>
                        </div>
                        <div className="flex w-full justify-between font-semibold">
                            Time Remaining
                            <p>{formatTime(timer.remainingTime)}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="text-sm text-muted-foreground mb-2">
                        Created: {formatDate(timer.createdAt)}
                    </div>
                    <div className="text-sm mb-2 flex gap-1">
                        Tags: {timer.tags?.length ? (
                            timer.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary">{tag}</Badge>
                            ))
                        ) : (
                            <Badge variant="secondary" className="opacity-50">Untagged</Badge>
                        )}
                    </div>
                    {timer.completedAt && <div className="text-sm text-muted-foreground mb-2">
                        Completed: {formatDate(timer.completedAt)}
                    </div>}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {timer.status !== 'COMPLETED' &&
                            <Button disabled={allTimers.findIndex(timer => timer.status === 'ACTIVE') > -1 && timer.status === 'PAUSED'} onClick={() => toggleTimer()} className="flex-grow">
                                {timer.status === 'ACTIVE' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                                {timer.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                            </Button>}
                        {timer.status !== 'COMPLETED' && <Button onClick={() => {
                            markComplete(timer, setStatus);
                            workerRef.current?.postMessage({
                                type: 'STOP_TIMER'
                            })
                        }}>Mark Complete</Button>}
                        {timer.status === 'COMPLETED' && <Button onClick={addTime}>+ 10</Button>}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Tag className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <div className="p-2">
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        await addTagDB(timer.id, newTag);
                                        addTag(timer.id, newTag);
                                        setNewTag('');
                                    }}>
                                        <Input
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="Add new tag"
                                        />
                                    </form>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-2">Comments</h3>
                        <Collapsible
                            open={isCommentsOpen}
                            onOpenChange={setIsCommentsOpen}
                            className="mt-4 space-y-2"
                        >
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full justify-between">
                                    Comments ({timer.comments?.length || 0})
                                    <MessageSquare className="h-4 w-4" />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-2">
                                {timer.comments?.map((comment, index) => (
                                    <div 
                                        key={index} 
                                        className="rounded-md border p-2 text-sm"
                                    >
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            className="prose prose-sm dark:prose-invert max-w-none"
                                        >
                                            {comment}
                                        </ReactMarkdown>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={async (e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                await addCommentDB(timer.id, newComment)
                                                addComment(timer.id, newComment)
                                                setNewComment('')
                                            }
                                        }}
                                    />
                                    <Button size="sm">Add</Button>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
