import * as React from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JournalEntry } from '@/types'
import { API } from '@/config/api'
import { format } from 'date-fns'
import { Pencil, Trash, Save, X, BookOpen, Calendar, Clock } from 'lucide-react'
import { WithLoading } from '@/hoc/hoc'
import { WithSidebarTrigger } from './with-sidebar-trigger'
import { cn } from '@/lib/utils'
import { Separator } from './ui/separator'
import { motion } from 'framer-motion'

export function JournalDashboard() {
    const [entries, setEntries] = React.useState<JournalEntry[]>([])
    const [newEntry, setNewEntry] = React.useState('')
    const [editingId, setEditingId] = React.useState<string | null>(null)
    const [editContent, setEditContent] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(true)

    const fetchEntries = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API.getUrl('JOURNAL'), {
                credentials: 'include'
            });
            const data = await response.json();
            setEntries(data);
        } catch (error) {
            console.error('Failed to fetch journal entries:', error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchEntries();
    }, []);

    const addEntry = async () => {
        if (!newEntry.trim()) return;
        setIsLoading(true);

        try {
            const response = await fetch(API.getUrl('JOURNAL'), {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: newEntry
                })
            });

            const data = await response.json();
            setEntries(prev => [data, ...prev]);
            setNewEntry('');
        } catch (error) {
            console.error('Failed to add journal entry:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateEntry = async (id: string) => {
        if (!editContent.trim()) return;
        setIsLoading(true);

        try {
            const response = await fetch(`${API.getUrl('JOURNAL')}/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: editContent })
            });

            const data = await response.json();
            setEntries(prev => prev.map(entry =>
                entry.id === id ? data : entry
            ));
            setEditingId(null);
        } catch (error) {
            console.error('Failed to update journal entry:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteEntry = async (id: string) => {
        setIsLoading(true);

        try {
            await fetch(`${API.getUrl('JOURNAL')}/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            setEntries(prev => prev.filter(entry => entry.id !== id));
        } catch (error) {
            console.error('Failed to delete journal entry:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-8 space-y-8 max-w-7xl">
            <WithLoading isLoading={isLoading} isScreen={true}>
                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center bg-gradient-to-r from-yellow-50/80 to-yellow-100/80 dark:from-yellow-950/40 dark:to-yellow-900/40 p-4 sm:p-6 rounded-xl shadow-lg border border-yellow-200/50 dark:border-yellow-800/50 backdrop-blur-sm">
                        <WithSidebarTrigger>
                            <div className="flex-1 space-y-1 text-center sm:text-left">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent dark:from-yellow-400 dark:to-yellow-300">
                                    Journal
                                </h1>
                                <p className="text-sm text-muted-foreground">Record your thoughts and reflections</p>
                            </div>
                        </WithSidebarTrigger>
                    </div>

                    {/* New Entry Section */}
                    <Card className="overflow-hidden border-yellow-100 dark:border-yellow-900/50 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6 space-y-4">
                            <Textarea
                                placeholder="What's on your mind?"
                                value={newEntry}
                                onChange={(e) => setNewEntry(e.target.value)}
                                className="min-h-[150px] border-yellow-200/50 dark:border-yellow-800/50 resize-none focus:ring-yellow-500/30 focus:border-yellow-500/30"
                            />
                            <Button
                                onClick={addEntry}
                                disabled={isLoading || !newEntry.trim()}
                                size="lg"
                                className="w-full sm:w-auto bg-yellow-600 text-white shadow-md hover:shadow-lg transition-all dark:from-yellow-700 dark:to-yellow-600"
                            >
                                Add Entry
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Entries List */}
                    <div className="grid gap-4 md:grid-cols-1">
                        {entries.map(entry => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className={cn(
                                    "group hover:shadow-lg transition-all duration-300 border-yellow-100 dark:border-yellow-900/50",
                                    editingId === entry.id && "ring-2 ring-yellow-500/30"
                                )}>
                                    <CardContent className="p-4">
                                        {editingId === entry.id ? (
                                            <div className="space-y-4">
                                                <Textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className="min-h-[150px] bg-yellow-50/50 dark:bg-yellow-950/50 border-yellow-200/50 dark:border-yellow-800/50 resize-none"
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => updateEntry(entry.id)}
                                                        disabled={isLoading}
                                                        className="bg-gradient-to-r from-green-600 to-green-500"
                                                    >
                                                        <Save className="h-4 w-4 mr-2" /> Save
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setEditingId(null)}
                                                        className="border-yellow-200 hover:border-yellow-300 dark:border-yellow-800 dark:hover:border-yellow-700"
                                                    >
                                                        <X className="h-4 w-4 mr-2" /> Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                                                    {entry.content}
                                                </p>
                                                <div className="flex justify-between items-center pt-2">
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-4 w-4 text-yellow-500" />
                                                            <span>{format(new Date(entry.created_at), 'PP')}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="h-4 w-4 text-yellow-500" />
                                                            <span>{format(new Date(entry.created_at), 'p')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setEditingId(entry.id);
                                                                setEditContent(entry.content);
                                                            }}
                                                            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => deleteEntry(entry.id)}
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </WithLoading>
        </div>
    )
}