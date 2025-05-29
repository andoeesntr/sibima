
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Calendar, User, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface JournalEntry {
  id: string;
  student_id: string;
  entry_date: string;
  meeting_date: string | null;
  topics_discussed: string;
  supervisor_notes: string | null;
  progress_percentage: number;
  status: string;
  created_at: string;
  student: {
    full_name: string;
    nim: string;
  } | null;
}

const SupervisorJournalReview = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingEntry, setReviewingEntry] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const { user } = useAuth();

  const fetchJournalEntries = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kp_journal_entries')
        .select(`
          *,
          student:profiles!kp_journal_entries_student_id_fkey (
            full_name,
            nim
          )
        `)
        .eq('supervisor_id', user.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      console.log('Fetched journal entries for supervisor:', data);
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      toast.error('Gagal mengambil data jurnal');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (entryId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('kp_journal_entries')
        .update({
          status: newStatus,
          supervisor_notes: reviewNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (error) throw error;

      toast.success('Review berhasil disimpan');
      setReviewingEntry(null);
      setReviewNotes('');
      fetchJournalEntries();
    } catch (error) {
      console.error('Error updating journal entry:', error);
      toast.error('Gagal menyimpan review');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-gray-500' },
      approved: { label: 'Disetujui', className: 'bg-green-500' },
      revision_needed: { label: 'Perlu Revisi', className: 'bg-orange-500' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  useEffect(() => {
    fetchJournalEntries();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review Logbook Mahasiswa</h2>
        <p className="text-gray-600">Review dan berikan feedback pada jurnal harian mahasiswa</p>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada jurnal</h3>
            <p className="text-gray-500">Belum ada mahasiswa yang mengirim jurnal untuk direview</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(entry.entry_date), 'dd MMMM yyyy', { locale: id })}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {entry.student?.full_name} ({entry.student?.nim})
                      </span>
                      {entry.meeting_date && (
                        <span>
                          Bimbingan: {format(new Date(entry.meeting_date), 'dd MMM yyyy HH:mm', { locale: id })}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(entry.status)}
                    <Badge variant="outline">{entry.progress_percentage}%</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Materi yang Dibahas:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{entry.topics_discussed}</p>
                  </div>
                  
                  {entry.supervisor_notes && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-blue-800">Catatan Review:</h4>
                      <p className="text-blue-700 whitespace-pre-wrap">{entry.supervisor_notes}</p>
                    </div>
                  )}

                  {entry.status === 'draft' && (
                    <div className="border-t pt-4">
                      {reviewingEntry === entry.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Catatan Review:</label>
                            <Textarea
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              placeholder="Berikan catatan atau feedback untuk mahasiswa..."
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleReviewSubmit(entry.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Setujui
                            </Button>
                            <Button
                              onClick={() => handleReviewSubmit(entry.id, 'revision_needed')}
                              variant="outline"
                              className="border-orange-500 text-orange-600 hover:bg-orange-50"
                            >
                              Minta Revisi
                            </Button>
                            <Button
                              onClick={() => {
                                setReviewingEntry(null);
                                setReviewNotes('');
                              }}
                              variant="outline"
                            >
                              Batal
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setReviewingEntry(entry.id)}
                          className="w-full"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Review Jurnal
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupervisorJournalReview;
