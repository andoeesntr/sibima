
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Save, X, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useStudentDashboard } from '@/hooks/useStudentDashboard';

interface JournalEntry {
  id: string;
  entry_date: string;
  meeting_date: string | null;
  topics_discussed: string;
  supervisor_notes: string | null;
  progress_percentage: number;
  status: string;
  created_at: string;
  supervisor: {
    full_name: string;
  } | null;
}

const KpJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const { user } = useAuth();
  const { selectedProposal } = useStudentDashboard();

  const [newEntry, setNewEntry] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    meeting_date: '',
    topics_discussed: '',
    progress_percentage: 0,
    supervisor_id: ''
  });

  const fetchEntries = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('kp_journal_entries')
        .select(`
          *,
          supervisor:profiles!kp_journal_entries_supervisor_id_fkey (
            full_name
          )
        `)
        .eq('student_id', user.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      toast.error('Gagal mengambil data jurnal');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisors = async () => {
    if (!user?.id || !selectedProposal) return;

    try {
      console.log('Fetching supervisors for proposal:', selectedProposal.id);
      
      // Get supervisors from the selected proposal
      if (selectedProposal.supervisors && selectedProposal.supervisors.length > 0) {
        const supervisorsList = selectedProposal.supervisors.map(supervisor => ({
          id: supervisor.id,
          full_name: supervisor.full_name || 'Unknown'
        }));

        console.log('Found supervisors from proposal:', supervisorsList);
        setSupervisors(supervisorsList);
        
        // Set default supervisor if only one
        if (supervisorsList.length === 1) {
          setNewEntry(prev => ({ ...prev, supervisor_id: supervisorsList[0].id }));
        }
        return;
      }

      // Fallback: Get supervisors from team_supervisors table
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .single();

      if (teamError || !teamMember) {
        console.log('No team found for user, trying direct supervisor lookup');
        return;
      }

      const { data: teamSupervisors, error: supervisorError } = await supabase
        .from('team_supervisors')
        .select(`
          supervisor_id,
          supervisor:profiles!team_supervisors_supervisor_id_fkey (
            id,
            full_name
          )
        `)
        .eq('team_id', teamMember.team_id);

      if (supervisorError) throw supervisorError;

      if (teamSupervisors && teamSupervisors.length > 0) {
        const supervisorsList = teamSupervisors.map(ts => ({
          id: ts.supervisor.id,
          full_name: ts.supervisor.full_name || 'Unknown'
        }));

        console.log('Found supervisors from team:', supervisorsList);
        setSupervisors(supervisorsList);
        
        if (supervisorsList.length === 1) {
          setNewEntry(prev => ({ ...prev, supervisor_id: supervisorsList[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    }
  };

  const handleAddEntry = async () => {
    if (!user?.id || !newEntry.supervisor_id) {
      toast.error('Pilih dosen pembimbing terlebih dahulu');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('kp_journal_entries')
        .insert({
          student_id: user.id,
          supervisor_id: newEntry.supervisor_id,
          entry_date: newEntry.entry_date,
          meeting_date: newEntry.meeting_date || null,
          topics_discussed: newEntry.topics_discussed,
          progress_percentage: newEntry.progress_percentage,
          status: 'draft'
        })
        .select(`
          *,
          supervisor:profiles!kp_journal_entries_supervisor_id_fkey (
            full_name
          )
        `)
        .single();

      if (error) throw error;

      setEntries(prev => [data, ...prev]);
      setNewEntry({
        entry_date: new Date().toISOString().split('T')[0],
        meeting_date: '',
        topics_discussed: '',
        progress_percentage: 0,
        supervisor_id: supervisors.length === 1 ? supervisors[0].id : ''
      });
      setIsAddingEntry(false);
      toast.success('Entri jurnal berhasil ditambahkan');
    } catch (error) {
      console.error('Error adding journal entry:', error);
      toast.error('Gagal menambahkan entri jurnal');
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
    fetchEntries();
  }, [user?.id]);

  useEffect(() => {
    if (selectedProposal) {
      fetchSupervisors();
    }
  }, [user?.id, selectedProposal]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if student has approved proposal and supervisors
  const hasApprovedProposal = selectedProposal?.status === 'approved';
  const hasSupervisors = supervisors.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Digital Journal/Logbook</h2>
          <p className="text-gray-600">Catat progress harian dan mingguan KP Anda</p>
        </div>
        {hasApprovedProposal && hasSupervisors && (
          <Button onClick={() => setIsAddingEntry(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Entri
          </Button>
        )}
      </div>

      {!hasApprovedProposal ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800">
              Proposal Anda belum disetujui. Tunggu persetujuan koordinator untuk dapat menggunakan logbook.
            </p>
          </CardContent>
        </Card>
      ) : !hasSupervisors ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800">
              Anda belum memiliki dosen pembimbing. Tunggu penugasan dari koordinator.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Add New Entry Form */}
      {isAddingEntry && hasApprovedProposal && hasSupervisors && (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Entri Jurnal Baru</CardTitle>
            <CardDescription>
              Isi form di bawah untuk menambahkan entri jurnal baru
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entry_date">Tanggal Entri</Label>
                <Input
                  id="entry_date"
                  type="date"
                  value={newEntry.entry_date}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, entry_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting_date">Tanggal Bimbingan (Opsional)</Label>
                <Input
                  id="meeting_date"
                  type="datetime-local"
                  value={newEntry.meeting_date}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, meeting_date: e.target.value }))}
                />
              </div>
            </div>

            {supervisors.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="supervisor">Dosen Pembimbing</Label>
                <select
                  id="supervisor"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newEntry.supervisor_id}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, supervisor_id: e.target.value }))}
                >
                  <option value="">Pilih Dosen Pembimbing</option>
                  {supervisors.map(supervisor => (
                    <option key={supervisor.id} value={supervisor.id}>
                      {supervisor.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="topics">Materi yang Dibahas</Label>
              <Textarea
                id="topics"
                placeholder="Tuliskan materi yang dibahas dalam bimbingan..."
                value={newEntry.topics_discussed}
                onChange={(e) => setNewEntry(prev => ({ ...prev, topics_discussed: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Persentase Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={newEntry.progress_percentage}
                onChange={(e) => setNewEntry(prev => ({ ...prev, progress_percentage: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddEntry} disabled={!newEntry.topics_discussed.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
              <Button variant="outline" onClick={() => setIsAddingEntry(false)}>
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Display supervisors info for debugging */}
      {supervisors.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-blue-800">
              Dosen Pembimbing: {supervisors.map(s => s.full_name).join(', ')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Journal Entries List */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">Belum ada entri jurnal. Tambahkan entri pertama Anda!</p>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(entry.entry_date), 'dd MMMM yyyy', { locale: id })}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      {entry.supervisor && (
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {entry.supervisor.full_name}
                        </span>
                      )}
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
                      <h4 className="font-medium mb-2 text-blue-800">Catatan Dosen:</h4>
                      <p className="text-blue-700 whitespace-pre-wrap">{entry.supervisor_notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default KpJournal;
