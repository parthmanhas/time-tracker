import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import { Edit2, Pause, Play, Tag, X, MessageSquare, CheckCircle } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Button } from './ui/button'
import React from "react"
import { TimerType } from "@/types"

export function Timer({ timer }: { timer: TimerType }) {
    const [editingTimerId, setEditingTimerId] = React.useState<string | null>(null)
    const [newTag, setNewTag] = React.useState('')
    const [allTags, setAllTags] = React.useState<string[]>(['finished', 'unfinished'])
    const [newComment, setNewComment] = React.useState('')
    const [status, setStatus] = React.useState(timer.status)
    const [remainingTime, setRemainingTime] = React.useState(timer.remainingTime)

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

    const addTag = (timerId: string, tag: string) => {
        if (tag.trim() === '') return

        // setTimers(timers.map(timer => {
        //   if (timer.id === timerId) {
        //     let newTags = [...timer.tags]
        //     if (tag === 'finished') {
        //       newTags = newTags.filter(t => t !== 'unfinished')
        //       if (!newTags.includes('finished')) {
        //         newTags.push('finished')
        //       }
        //     } else if (tag === 'unfinished') {
        //       if (timer.status === 'ACTIVE') {
        //         newTags = newTags.filter(t => t !== 'finished')
        //         if (!newTags.includes('unfinished')) {
        //           newTags.push('unfinished')
        //         }
        //       }
        //     } else if (!newTags.includes(tag)) {
        //       newTags.push(tag)
        //     }
        //     return { ...timer, tags: newTags }
        //   }
        //   return timer
        // }))

        if (!allTags.includes(tag)) {
            setAllTags([...allTags, tag])
        }

        setNewTag('')
    }

    const removeTag = (timerId: string, tagToRemove: string) => {
        // setTimers(timers.map(timer => {
        //   if (timer.id === timerId) {
        //     return { ...timer, tags: timer.tags.filter(tag => tag !== tagToRemove) }
        //   }
        //   return timer
        // }))

        // Remove tag from allTags if it's not used by any timer
        // const isTagUsed = timers.some(timer => timer.tags.includes(tagToRemove))
        // if (!isTagUsed && tagToRemove !== 'finished' && tagToRemove !== 'unfinished') {
        //   setAllTags(allTags.filter(tag => tag !== tagToRemove))
        // }
    }

    const toggleTimer = () => {
        setStatus(status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE');
    }

    const completeTimer = async (timer: TimerType | undefined) => {
        if (!timer) {
            console.error('Timer not found');
            return;
        }
        const { comments, tags, ...timersWithoutCommentsAndTags } = timer;
        console.log(timersWithoutCommentsAndTags)
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

    React.useEffect(() => {
        if (status === 'PAUSED') return;
        if (status === 'COMPLETED') completeTimer(timer);
        const interval = setInterval(() => {
            setRemainingTime(prevTime => {
                if (prevTime <= 0) {
                    setStatus('COMPLETED');
                    timer.status = 'COMPLETED';
                    timer.remainingTime = 0;
                    clearInterval(interval);
                    return 0;
                }
                const newRemainingTime = prevTime - 1;
                timer.remainingTime = newRemainingTime;
                return newRemainingTime;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [status])
    return (
        <Card key={timer.id}>
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                    {editingTimerId === timer.id ? (
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            // editTimerLabel(timer.id)
                        }} className="flex-grow mr-2">
                            {/* <Input
                                value={editedLabel}
                                onChange={(e) => setEditedLabel(e.target.value)}
                                className="text-lg font-semibold"
                            /> */}
                        </form>
                    ) : (
                        <span className="text-lg font-semibold">{timer.title}</span>
                    )}
                    {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (editingTimerId === timer.id) {
                                // editTimerLabel(timer.id)
                            } else {
                                setEditingTimerId(timer.id)
                                // setEditedLabel(timer.label)
                            }
                        }}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button> */}
                    {status === 'COMPLETED' && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                <div className="text-3xl font-bold mb-4">
                    {status === 'COMPLETED' ? formatTime(timer.duration) : formatTime(remainingTime)}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                    Created: {formatDate(timer.createdAt)}
                </div>
                <div className="flex space-x-2 mb-4">
                    {status !== 'COMPLETED' && <Button onClick={() => toggleTimer()} className="flex-grow">
                        {status === 'ACTIVE' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                        {status === 'ACTIVE' ? 'Pause' : 'Resume'}
                    </Button>}
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
                            {allTags.filter(tag => !['finished', 'unfinished'].includes(tag)).map(tag => (
                                <DropdownMenuItem key={tag} onSelect={() => addTag(timer.id, tag)}>
                                    {tag}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {timer.tags?.map(tag => (
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
            </CardContent>
        </Card>
    )
}
