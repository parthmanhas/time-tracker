import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@radix-ui/react-dropdown-menu"
import { Pause, Play, Tag, MessageSquare, CheckCircle } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { Button } from './ui/button'
import React from "react"
import { TimerType } from "@/types"

type TimerProps = {
    timer: TimerType,
    updateTimerState: (timer: TimerType) => void
}

export function Timer({ timer, updateTimerState }: TimerProps) {
    const [newComment, setNewComment] = React.useState('')
    const [status, setStatus] = React.useState(timer.status)
    const [remainingTime, setRemainingTime] = React.useState(timer.remainingTime)

    const completeAt = Date.now() + timer.duration * 1000;

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    const formatTimeHHMM = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const hours = minutes % 60;
        return `${hours}:${minutes}`
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
        setStatus(status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE');
        updateTimerState({ ...timer, status: status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' })
        updateTimerDB({ ...timer, status: status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' })
    }

    const updateTimerDB = async (timer: TimerType | undefined) => {
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

    const markComplete = async () => {
        if (timer.status === 'COMPLETED' || status === 'COMPLETED') {
            console.info('Timer already completed');
            return;
        };
        setStatus('COMPLETED');
        timer.status = 'COMPLETED';
        updateTimerState({ ...timer, status: 'COMPLETED' })
        await updateTimerDB(timer);
    }

    React.useEffect(() => {
        const completeTimer = (interval) => {
            setStatus('COMPLETED');
            timer.status = 'COMPLETED';
            updateTimerState({ ...timer, status: 'COMPLETED' })
            timer.remainingTime = 0;
            clearInterval(interval);
        }

        if (status === 'COMPLETED') return;
        if (status === 'PAUSED') return;
        // below happens in ACTIVE state

        const interval = setInterval(() => {
            if (Date.now() >= completeAt) {
                console.error('Timer already finished but timer running !!');
                completeTimer(interval);
            }
            setRemainingTime(prevTime => {
                if (prevTime <= 0) {
                    completeTimer(interval);
                    return 0;
                }
                const newRemainingTime = prevTime - 1;
                timer.remainingTime = newRemainingTime;
                return newRemainingTime;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [status, timer, updateTimerState, completeAt])
    return (
        <Card key={timer.id}>
            <CardContent className="p-4 flex flex-col justify-between h-full">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            {<span className="text-lg font-semibold">{timer.title}</span>}
                        </div>
                        <div className="flex h-full items-start">
                            {status === 'COMPLETED' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="flex w-full justify-between font-semibold">
                            Duration
                            <p>{formatTime(timer.duration)}</p>
                        </div>
                        <div className="flex w-full justify-between font-semibold">
                            Time Remaining
                            <p>{formatTime(remainingTime)}</p>
                        </div>
                        <div className="flex w-full justify-between font-semibold">
                            Time worked
                            <p>{formatTime(timer.duration - remainingTime)}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="text-sm text-muted-foreground mb-2">
                        Created: {formatDate(timer.createdAt)}
                    </div>
                    {timer.completedAt && <div className="text-sm text-muted-foreground mb-2">
                        Completed: {formatDate(timer.completedAt)}
                    </div>}
                    <div className="flex space-x-2 mb-4">
                        {status !== 'COMPLETED' && <Button onClick={() => toggleTimer()} className="flex-grow">
                            {status === 'ACTIVE' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                            {status === 'ACTIVE' ? 'Pause' : 'Resume'}
                        </Button>}
                        {status !== 'COMPLETED' && <Button onClick={markComplete}>Mark Complete</Button>}
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
                                        // addTag(timer.id, newTag)
                                    }}>
                                        {/* <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Add new tag"
                                    /> */}
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
                            // addComment(timer.id, newComment)
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
                </div>
            </CardContent>
        </Card>
    )
}
