import * as React from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JournalEntry } from '@/types'
import { API } from '@/config/api'
import { format } from 'date-fns'
import { Pencil, Trash, Save, X, BookOpen, Calendar, Clock } from 'lucide-react'
import { WithLoading } from '@/hoc/hoc'
import { WithSidebarTrigger } from './WithSidebarTrigger'
import { cn } from '@/lib/utils'
import { Separator } from './ui/separator'

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
        <div className="container mx-auto p-6">
            <WithLoading isLoading={isLoading} isScreen={true}>
                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <WithSidebarTrigger>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <BookOpen className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-800">Journal</h1>
                                    <p className="text-sm text-slate-500">Record your thoughts and reflections</p>
                                </div>
                            </div>
                        </WithSidebarTrigger>
                    </div>

                    {/* New Entry Section */}
                    <Card className="border-2 border-dashed hover:border-solid transition-all duration-200">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-xl font-semibold text-slate-800">New Entry</CardTitle>
                            <p className="text-sm text-slate-500">Write your thoughts for today</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="What's on your mind?"
                                    value={newEntry}
                                    onChange={(e) => setNewEntry(e.target.value)}
                                    className="min-h-[200px] bg-slate-50 border-slate-200 focus:border-purple-200 focus:ring-purple-200"
                                />
                                <Button
                                    onClick={addEntry}
                                    disabled={isLoading || !newEntry.trim()}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    Add Entry
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Entries List */}
                    <div className="space-y-4">
                        {entries.map(entry => (
                            <Card key={entry.id} className={cn(
                                "border shadow-sm hover:shadow-md transition-all duration-200",
                                editingId === entry.id && "border-purple-200"
                            )}>
                                <CardContent className="pt-6">
                                    {editingId === entry.id ? (
                                        <div className="space-y-4">
                                            <Textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="min-h-[200px] bg-slate-50"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateEntry(entry.id)}
                                                    disabled={isLoading}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Save Changes
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditingId(null)}
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                                                {entry.content}
                                            </p>
                                            <Separator />
                                            <div className="flex justify-between items-center pt-2">
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{format(new Date(entry.created_at), 'PP')}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <Clock className="h-4 w-4" />
                                                    <span>{format(new Date(entry.created_at), 'p')}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditingId(entry.id);
                                                            setEditContent(entry.content);
                                                        }}
                                                        className="text-slate-600 hover:text-slate-900"
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
                        ))}
                    </div>
                </div>
            </WithLoading>
        </div>
    )
}