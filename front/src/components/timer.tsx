import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@radix-ui/react-dropdown-menu"
import { Pause, Play, Tag, MessageSquare, CheckCircle } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { Button } from './ui/button'
import React from "react"
import { TimerType } from "@/types"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { useTimerStore } from "@/store/useTimerStore"

type TimerProps = {
    timer: TimerType,
}

export function Timer({ timer }: TimerProps) {

    const {
        setStatus,
        newComment,
        addComment,
        newTag,
        addTag,
        setRemainingTime
    } = useTimerStore();

    const completeAt = Date.now() + Math.abs(timer.remainingTime - timer.duration) * 1000;

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
        updateTimerDB({ ...timer, status: timer.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' });
    }

    const updateTimerDB = async (timer: TimerType | undefined) => {
        if (!timer) {
            console.error('Timer not found');
            return;
        }
        try {
            await fetch(`http://localhost:5000/api/timer`, {
                method: "PATCH",
                body: JSON.stringify({ ...timer, due_at: new Date(completeAt) }), // change label to timer everywhere
                headers: {
                    "Content-Type": "application/json",
                }
            });
        } catch (e) {
            console.error(e);
        }
    }

    const markComplete = async () => {
        if (timer.status === 'COMPLETED') {
            console.info('Timer already completed');
            return;
        };
        // await updateTimerDB(timer);

        try {
            await fetch('http://localhost:5000/api/timer', {
                method: 'PATCH',
                body: JSON.stringify({ id: timer.id, status: 'COMPLETED' }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            setStatus(timer.id, 'COMPLETED');
        } catch (e) {
            console.error(e);
        }
    }

    React.useEffect(() => {

        const completeTimer = (interval?: NodeJS.Timeout) => {
            timer.remainingTime = 0;
            if (interval)
                clearInterval(interval);
        }

        if (Date.now() >= completeAt) {
            completeTimer();
        }

        if (timer.status === 'COMPLETED') return;
        if (timer.status === 'PAUSED') return;
        // below happens in ACTIVE state

        const interval = setInterval(() => {
            if (Date.now() >= completeAt) {
                console.error('Timer already finished but timer running !!');
                completeTimer(interval);
            }

            if (timer.remainingTime <= 0) {
                completeTimer(interval);
                return;
            }

            setRemainingTime(timer.id, timer.remainingTime - 1);

        }, 1000);

        return () => clearInterval(interval);
    }, [completeAt, setRemainingTime, timer])

    const addTagDB = async (timerId: string, tag: string) => {
        if (!timerId) {
            console.error('timerId missing');
            return;
        }
        if (!tag) {
            console.error('tag missing');
            return;
        }
        try {
            await fetch('http://localhost:5000/add-tag', {
                method: 'post',
                body: JSON.stringify({ id: timerId, tag }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            addTag(timer.id, tag);
        } catch (e) {
            console.error(e);
        }
    }

    const addCommentDB = async (timerId: string, comment: string) => {
        try {
            await fetch('http://localhost:5000/comment', {
                method: 'post',
                body: JSON.stringify({ id: timerId, comment }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            addComment(timer.id, comment);
        } catch (e) {
            console.error(e);
        }
    }

    const addTime = async () => {
        timer.duration += timer.duration;
        timer.status = 'ACTIVE';
        try {
            await fetch('http://localhost:5000/api/timer', {
                method: 'PATCH',
                body: JSON.stringify({ id: timer.id, duration: timer.duration, status: timer.status }),
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
                        Tags: {timer.tags?.map((tag, index) => <Badge key={index} variant="secondary">{tag}</Badge>)}
                    </div>
                    {timer.completedAt && <div className="text-sm text-muted-foreground mb-2">
                        Completed: {formatDate(timer.completedAt)}
                    </div>}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {timer.status !== 'COMPLETED' && <Button onClick={() => toggleTimer()} className="flex-grow">
                            {timer.status === 'ACTIVE' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                            {timer.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                        </Button>}
                        {timer.status !== 'COMPLETED' && <Button onClick={markComplete}>Mark Complete</Button>}
                        {timer.status === 'COMPLETED' && <Button onClick={addTime}>+ 10</Button>}
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
                                        addTagDB(timer.id, newTag)
                                    }}>
                                        <Input
                                            value={newTag}
                                            onChange={(e) => addTag(timer.id, e.target.value)}
                                            placeholder="Add new tag"
                                        />
                                    </form>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-2">Comments</h3>
                        {timer.comments?.map((comment, index) => (
                            <div key={index} className="text-sm mb-1">{comment}</div>
                        ))}
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            addCommentDB(timer.id, newComment)
                        }} className="mt-2">
                            <Textarea
                                value={newComment}
                                onChange={(e) => addComment(timer.id, e.target.value)}
                                placeholder="Add a comment"
                                className="mb-2"
                            />
                            <Button type="submit" size="sm">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Add Comment
                            </Button>
                        </form>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
