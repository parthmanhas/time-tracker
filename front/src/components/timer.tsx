import { Pause, Play, MessageSquare, CheckCircle } from "lucide-react"
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
import { WithLoading } from "@/hoc/hoc"
import { useAuth } from "@/context/AuthContext"
import { Textarea } from "./ui/textarea"
import { cn } from "@/lib/utils"

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

    const { id: userId } = useAuth()?.user || {};

    const [newTag, setNewTag] = React.useState('');
    const [newComment, setNewComment] = React.useState('');
    const [isCommentsOpen, setIsCommentsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isHighlighted, setIsHighlighted] = React.useState(false);
    const timerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (timer.status === 'COMPLETED') {
            return;
        } else if (timer.status === 'ACTIVE') {
            workerRef?.current?.postMessage({
                type: "START_TIMER",
                payload: { id: timer.id, remainingTime: timer.remainingTime },
            });
        }

    }, []);

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
        setIsLoading(true);
        try {
            await fetch(API.getUrl('TIMER'), {
                method: "PATCH",
                credentials: 'include',
                body: JSON.stringify({ userId, ...timer, due_at: new Date(completeAt) }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    const addTagDB = async (timerId: string, tag: string) => {
        if (!timerId || !tag) {
            console.error('Missing required parameters');
            return;
        }
        setIsLoading(true);
        try {
            await fetch(API.getUrl('TAG'), {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({ userId, id: timerId, tag }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    const addCommentDB = async (timerId: string, comment: string) => {
        setIsLoading(true);
        try {
            await fetch(API.getUrl('COMMENT'), {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({ userId, id: timerId, comment }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    const addTime = async () => {
        setIsLoading(true);
        setDuration(timer.id, timer.duration + 600);
        setStatus(timer.id, 'ACTIVE');
        setRemainingTime(timer.id, 600);
        try {
            await fetch(API.getUrl('TIMER'), {
                method: 'PATCH',
                credentials: 'include',
                body: JSON.stringify({ userId, id: timer.id, duration: timer.duration + 600, status: timer.status }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    const addCommentToTimer = async () => {
        await addCommentDB(timer.id, newComment)
        addComment(timer.id, newComment)
        setNewComment('')
    }

    React.useEffect(() => {
        const highlightTimerId = localStorage.getItem('highlightTimerId');
        
        if (highlightTimerId === timer.id) {
            // Clear the stored ID
            localStorage.removeItem('highlightTimerId');
            
            // Scroll into view
            timerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add highlight effect
            setIsHighlighted(true);
            
            // Remove highlight after animation
            const timeout = setTimeout(() => {
                setIsHighlighted(false);
            }, 2000); // Duration matches the CSS animation
            
            return () => clearTimeout(timeout);
        }
    }, [timer.id]);

    return (
        <Card 
            ref={timerRef}
            className={cn(
                "transition-all duration-300",
                isHighlighted && "animate-highlight"
            )}
        >
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
                        <p>Created: {formatDate(timer.createdAt)}</p>
                        {timer.status !== 'COMPLETED' && <div className="font-semibold">Days Active: <Badge variant="outline">{Math.floor((Date.now() - new Date(timer.createdAt).getTime()) / (1000 * 60 * 60 * 24))}</Badge></div>}
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
                            <>
                                <WithLoading isLoading={isLoading}>
                                    <Button disabled={allTimers.findIndex(timer => timer.status === 'ACTIVE') > -1 && timer.status === 'PAUSED'} onClick={() => toggleTimer()} className="flex-grow">
                                        {timer.status === 'ACTIVE' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                                        {timer.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                                    </Button>
                                    <Button onClick={() => {
                                        markComplete(timer, setStatus);
                                        workerRef.current?.postMessage({
                                            type: 'STOP_TIMER'
                                        })
                                    }}>Mark Complete</Button>
                                </WithLoading>
                            </>
                        }
                        {timer.status === 'COMPLETED' && <WithLoading isLoading={isLoading}>
                            <Button onClick={addTime}>+ 10</Button>
                        </WithLoading>}
                    </div>
                    <div className="flex gap-2">
                        <WithLoading isLoading={isLoading}>
                            {/* input to add tags */}
                            <Input
                                placeholder="Add new tag"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)} />
                            <Button variant="outline" size="icon" onClick={async () => {
                                await addTagDB(timer.id, newTag);
                                addTag(timer.id, newTag);
                                setNewTag('');
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 0 36 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tag-with-plus !h-[2rem] !w-[1.75rem]">
                                    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                                    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
                                    <circle cx="20" cy="12" r="6" fill="white" stroke="currentColor" />
                                    <line x1="20" y1="9" x2="20" y2="15" stroke="currentColor" strokeWidth="2" />
                                    <line x1="17" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </Button>
                        </WithLoading>
                    </div>
                    <div>
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
                                    <Textarea
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={async (e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                await addCommentToTimer()
                                            }
                                        }}
                                    />
                                    <WithLoading isLoading={isLoading}>
                                        <Button onClick={addCommentToTimer} size="sm">Add</Button>
                                    </WithLoading>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
