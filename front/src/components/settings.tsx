import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoaderCircle, Tag, Trash2, Volume2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useTimerStore } from '@/store/useTimerStore'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { fetchAllTimers } from '@/lib/utils'
import { API } from '@/config/api'
import { useAuth } from '@/context/AuthContext'
import { Switch } from "@/components/ui/switch"
import { WithLoading } from '@/hoc/hoc'

export function Settings() {
  const { allTimers, setAllTimers } = useTimerStore()
  const [tagToDelete, setTagToDelete] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(() => {
    return localStorage.getItem('soundEnabled') !== 'false'
  });

  const { id: userId } = useAuth()?.user || {};
  const { logout } = useAuth();

  React.useEffect(() => {
    fetchAllTimers(setAllTimers, logout, setIsLoading);
  }, [])


  const uniqueTags = React.useMemo(() => {
    const tags = new Set<string>()
    allTimers.forEach(timer => {
      timer.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags)
  }, [allTimers])

  const getTagUsageCount = (tag: string) => {
    return allTimers.filter(timer => timer.tags?.includes(tag)).length
  }

  const handleDeleteTag = async (tag: string) => {
    await fetch(API.getUrl('TAG'), {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, tag }),
    })
    const updatedTimers = allTimers.map(timer => ({
      ...timer,
      tags: timer.tags?.filter(t => t !== tag)
    }))
    setAllTimers(updatedTimers)
    setTagToDelete(null)
  }

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('soundEnabled', enabled.toString());
  };

  return (
    <div className="container mx-auto p-6">
      <WithLoading isLoading={isLoading} size={80} isScreen={true}>
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tag Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {uniqueTags.length === 0 ? (
                  <p className="text-muted-foreground">No tags created yet.</p>
                ) : (
                  uniqueTags.map(tag => (
                    <div
                      key={tag}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">
                          {tag}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Used in {getTagUsageCount(tag)} timer{getTagUsageCount(tag) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTagToDelete(tag)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Sound Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Timer Completion Sound</p>
                  <p className="text-sm text-muted-foreground">
                    Play a sound when a timer completes
                  </p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={handleSoundToggle}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <AlertDialog open={!!tagToDelete} onOpenChange={() => setTagToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Tag</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the tag "{tagToDelete}"? This will remove it from all timers.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => tagToDelete && handleDeleteTag(tagToDelete)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </WithLoading>
    </div>
  )
} 