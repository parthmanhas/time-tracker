import { Pause, Play, MessageSquare, CheckCircle, Clock, Calendar, Tag, Timer as TimerIcon } from "lucide-react"
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
import { useAuth } from "@/context/auth-context"
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

    const addTime = async (seconds = 600) => {
        setIsLoading(true);
        setDuration(timer.id, timer.duration + seconds);
        setStatus(timer.id, 'ACTIVE');
        setRemainingTime(timer.id, seconds);
        try {
            await fetch(API.getUrl('TIMER'), {
                method: 'PATCH',
                credentials: 'include',
                body: JSON.stringify({ userId, id: timer.id, duration: timer.duration + seconds, status: timer.status }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            workerRef.current?.postMessage({
                type: 'START_TIMER',
                payload: { id: timer.id, remainingTime: timer.remainingTime + seconds },
            });
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
                "transition-all duration-300 overflow-hidden",
                "bg-gradient-to-br from-white to-slate-50",
                "hover:shadow-lg border-slate-200",
                isHighlighted && "animate-highlight"
            )}
        >
            <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-800 line-clamp-2">
                                {timer.title}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {timer.status === 'COMPLETED' && (
                                <div className="bg-green-100 p-1.5 rounded-full">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                            )}
                            {timer.status === 'ACTIVE' && (
                                <div className="bg-blue-100 p-1.5 rounded-full animate-pulse">
                                    <TimerIcon className="h-4 w-4 text-blue-600" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timer Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                            <Clock className="h-4 w-4 text-slate-500" />
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500">Duration</span>
                                <span className="font-medium">{formatTime(timer.duration)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                            <TimerIcon className="h-4 w-4 text-slate-500" />
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500">Remaining</span>
                                <span className="font-medium">{formatTime(timer.remainingTime)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Metadata */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="h-4 w-4" />
                            <span>Created: {formatDate(timer.createdAt)}</span>
                        </div>
                        {timer.status !== 'COMPLETED' && (
                            <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="bg-slate-50">
                                    {Math.floor((Date.now() - new Date(timer.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days active
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <Tag className="h-4 w-4 text-slate-400" />
                        {timer.tags?.length ? (
                            timer.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="bg-slate-100 hover:bg-slate-200">
                                    {tag}
                                </Badge>
                            ))
                        ) : (
                            <Badge variant="secondary" className="opacity-50 bg-slate-100">
                                Untagged
                            </Badge>
                        )}
                    </div>

                    {timer.completedAt && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>Completed: {formatDate(timer.completedAt)}</span>
                        </div>
                    )}

                    <WithLoading isLoading={isLoading}>
                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                            {timer.status !== 'COMPLETED' ? (
                                <>
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                        disabled={allTimers.findIndex(t => t.status === 'ACTIVE') > -1 && timer.status === 'PAUSED'}
                                        onClick={toggleTimer}
                                    >
                                        {timer.status === 'ACTIVE' ? (
                                            <><Pause className="mr-2 h-4 w-4" /> Pause</>
                                        ) : (
                                            <><Play className="mr-2 h-4 w-4" /> Resume</>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            markComplete(timer, setStatus, setIsLoading);
                                            workerRef.current?.postMessage({ type: 'STOP_TIMER' })
                                        }}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                                    >
                                        Mark Complete
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        onClick={() => addTime(600)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white"
                                    >
                                        + 10 Min
                                    </Button>
                                    <Button
                                        onClick={() => addTime(1200)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white"
                                    >
                                        + 20 Min
                                    </Button>
                                    <Button
                                        onClick={() => addTime(1800)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white"
                                    >
                                        + 30 Min
                                    </Button>
                                </>

                            )}
                        </div>

                        {/* Tag Input */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add new tag"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                className="bg-slate-50"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={async () => {
                                    await addTagDB(timer.id, newTag);
                                    addTag(timer.id, newTag);
                                    setNewTag('');
                                }}
                            >
                                <Tag className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Comments Section */}
                        <Collapsible
                            open={isCommentsOpen}
                            onOpenChange={setIsCommentsOpen}
                            className="mt-4 space-y-2"
                        >
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full justify-between hover:bg-slate-100">
                                    Comments ({timer.comments?.length || 0})
                                    <MessageSquare className="h-4 w-4" />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-2">
                                {timer.comments?.map((comment, index) => (
                                    <div
                                        key={index}
                                        className="rounded-lg border p-3 bg-slate-50"
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
                                        className="bg-slate-50 min-h-[80px]"
                                    />
                                    <Button
                                        onClick={addCommentToTimer}
                                        size="sm"
                                        className="self-start"
                                    >
                                        Add
                                    </Button>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </WithLoading>
                </div>
            </CardContent>
        </Card>
    )
}
