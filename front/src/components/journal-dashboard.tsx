import * as React from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JournalEntry } from '@/types'
import { API } from '@/config/api'
import { format } from 'date-fns'
import { Pencil, Trash, Save, X } from 'lucide-react'

export function JournalDashboard() {
  const [entries, setEntries] = React.useState<JournalEntry[]>([])
  const [newEntry, setNewEntry] = React.useState('')
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editContent, setEditContent] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchEntries = async () => {
    try {
      const response = await fetch(API.getUrl('JOURNAL'), {
        credentials: 'include'
      });
      const data = await response.json();
      console.log(data)
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch journal entries:', error);
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
      <h1 className="text-2xl font-bold mb-6">Journal</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">New Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Write your thoughts..."
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              className="min-h-[200px]"
            />
            <Button 
              onClick={addEntry} 
              disabled={isLoading || !newEntry.trim()}
            >
              Add Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {entries.map(entry => (
          <Card key={entry.id}>
            <CardContent className="pt-6">
              {editingId === entry.id ? (
                <div className="space-y-4">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateEntry(entry.id)}
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
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
                <div>
                  <p className="whitespace-pre-wrap">{entry.content}</p>
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-md ">
                      {format(new Date(entry.created_at), 'PPp')}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(entry.id);
                          setEditContent(entry.content);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => deleteEntry(entry.id)}
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
  )
} 