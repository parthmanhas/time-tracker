import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tag, Trash2, Volume2, Settings as SettingsIcon, Hash } from "lucide-react"
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
import { useAuth } from '@/context/auth-context'
import { Switch } from "@/components/ui/switch"
import { WithLoading } from '@/hoc/hoc'
import { WithSidebarTrigger } from './with-sidebar-trigger'

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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <WithSidebarTrigger>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <SettingsIcon className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
                  <p className="text-sm text-slate-500">Manage your application preferences</p>
                </div>
              </div>
            </WithSidebarTrigger>
          </div>

          <div className="grid gap-6">
            {/* Tag Management Card */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Tag className="h-4 w-4 text-purple-600" />
                  </div>
                  Tag Management
                </CardTitle>
                <CardDescription>
                  Manage and organize your timer tags
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-slate-100 rounded-lg">
                      <Hash className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      Total Tags: {uniqueTags.length}
                    </span>
                  </div>
                  
                  {uniqueTags.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
                      <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No tags created yet.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {uniqueTags.map(tag => (
                        <div
                          key={tag}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant="outline" 
                              className="bg-white border-purple-200 text-purple-700"
                            >
                              {tag}
                            </Badge>
                            <span className="text-sm text-slate-600">
                              {getTagUsageCount(tag)} timer{getTagUsageCount(tag) !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTagToDelete(tag)}
                            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sound Settings Card */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <Volume2 className="h-4 w-4 text-green-600" />
                  </div>
                  Sound Settings
                </CardTitle>
                <CardDescription>
                  Configure notification sounds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="space-y-1">
                    <p className="font-medium text-slate-700">Timer Completion Sound</p>
                    <p className="text-sm text-slate-500">
                      Play a sound when a timer completes
                    </p>
                  </div>
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={handleSoundToggle}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alert Dialog */}
        <AlertDialog open={!!tagToDelete} onOpenChange={() => setTagToDelete(null)}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl text-slate-800">Delete Tag</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                Are you sure you want to delete the tag "{tagToDelete}"? This will remove it from all timers.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="border-slate-200">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => tagToDelete && handleDeleteTag(tagToDelete)}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete Tag
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </WithLoading>
    </div>
  )
}