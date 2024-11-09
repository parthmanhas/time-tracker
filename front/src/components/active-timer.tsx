import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@radix-ui/react-dropdown-menu"
import { Pause, Play, Tag, X, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import React, { useEffect, useState } from "react"

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

export default function Timer({ id, label, duration }: Timer) {

    const [timerState, setTimerState] = React.useState<Timer>({
        id,
        label,
        duration: duration,
        remainingTime: duration,
        tags: ['unfinished'],
        status: "ACTIVE",
        createdAt: new Date().toDateString(),
        comments: []
    });
    const [newTag, setNewTag] = useState('');
    const [newComment, setNewComment] = useState('');

    const toggleTimer = () => {
        setTimerState(prev => ({
            ...prev,
            status: prev.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
        }))
    }

    useEffect(() => {
        const id = setInterval(() => {
            if (timerState.remainingTime <= 0) {
                clearInterval(id);
                setTimerState(prev => ({
                    ...prev,
                    status: 'FINISHED'
                }))
            }
            if (timerState.status === 'ACTIVE') {
                setTimerState(prev => ({
                    ...prev,
                    remainingTime: prev.remainingTime - 1
                }))
            }
        }, 1000)
    }, [])

    return <Card key={id}>
        <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold">{label}</span>
            </div>
            <div className="text-3xl font-bold mb-4">
                {formatTime(timerState.remainingTime)}
            </div>
            <div className="text-sm text-muted-foreground mb-2">
                Created: {formatDate(timerState.createdAt)}
            </div>
            <div className="flex space-x-2 mb-4">
                <Button onClick={() => toggleTimer()} className="flex-grow">
                    {timerState.status === 'ACTIVE' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {timerState.status === 'ACTIVE' ? 'Pause' : 'Resume'}
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
                                setTimerState(prev => ({
                                    ...prev,
                                    tags: [...prev.tags, newTag]
                                }))
                            }}>
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Add new tag"
                                />
                            </form>
                        </div>
                        {/* {allTags.filter(tag => !['finished', 'unfinished'].includes(tag)).map(tag => (
                            <DropdownMenuItem key={tag} onSelect={() => addTag(timer.id, tag)}>
                                {tag}
                            </DropdownMenuItem>
                        ))} */}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
                {timerState.tags.map(tag => (
                    <div key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm flex items-center">
                        {tag}
                        {!['finished', 'unfinished'].includes(tag) && <Button
                            variant="ghost"
                            size="sm"
                            className="ml-1 p-0 h-4 w-4"
                            onClick={() => setTimerState(prev => ({
                                ...prev,
                                tags: prev.tags.filter(t => t !== tag)
                            }))}
                        >
                            <X className="h-3 w-3" />
                        </Button>}
                    </div>
                ))}
            </div>
            <div>
                <h3 className="text-sm font-semibold mb-2">Comments</h3>
                {timerState.comments.map((comment, index) => (
                    <div key={index} className="text-sm mb-1">{comment}</div>
                ))}
                <form onSubmit={(e) => {
                    e.preventDefault()
                    setTimerState(prev => ({
                        ...prev,
                        comments: [...prev.comments, newComment]
                    }))
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
}