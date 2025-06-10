import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Plus, Upload, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDate } from '@/services/mockData';

interface GuidanceSession {
  id: string;
  student_id: string;
  supervisor_id: string;
  requested_date: string;
  topic: string;
  location: string;
  duration_minutes: number;
  status: string;
  supervisor_notes: string | null;
  evidence_url: string | null;
  created_at: string;
  updated_at: string;
  meeting_link: string | null;
  supervisor: {
    full_name: string;
  };
}

const KpGuidanceSchedule = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<GuidanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState<string | null>(null);

  // Form state for new request
  const [formData, setFormData] = useState({
    supervisor_id: '',
    requested_date: '',
    topic: '',
    location: '',
    duration_minutes: 60
  });

  // Evidence upload state
  const [evidenceFiles, setEvidenceFiles] = useState<{[key: string]: File}>({});

  useEffect(() => {
    if (user?.id) {
      fetchGuidanceSessions();
    }
  }, [user?.id]);

  const fetchGuidanceSessions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('kp_guidance_schedule')
        .select(`
          *,
          supervisor:profiles!kp_guidance_schedule_supervisor_id_fkey (full_name)
        `)
        .eq('student_id', user?.id)
        .order('requested_date', { ascending: false });

      if (error) throw error;

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching guidance sessions:', error);
      toast.error('Gagal memuat jadwal bimbingan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supervisor_id || !formData.requested_date || !formData.topic) {
      toast.error('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('kp_guidance_schedule')
        .insert({
          student_id: user?.id,
          supervisor_id: formData.supervisor_id,
          requested_date: formData.requested_date,
          topic: formData.topic,
          location: formData.location,
          duration_minutes: formData.duration_minutes,
          status: 'requested'
        });

      if (error) throw error;

      toast.success('Permintaan bimbingan berhasil diajukan');
      setShowRequestDialog(false);
      setFormData({
        supervisor_id: '',
        requested_date: '',
        topic: '',
        location: '',
        duration_minutes: 60
      });
      
      fetchGuidanceSessions();
    } catch (error) {
      console.error('Error submitting guidance request:', error);
      toast.error('Gagal mengajukan permintaan bimbingan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadEvidence = async (sessionId: string) => {
    const file = evidenceFiles[sessionId];
    if (!file) {
      toast.error('Mohon pilih file bukti bimbingan');
      return;
    }

    try {
      setUploadingEvidence(sessionId);

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `guidance-evidence-${sessionId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('guidance-evidence')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('guidance-evidence')
        .getPublicUrl(fileName);

      // Update session with evidence URL and mark as completed
      const { error: updateError } = await supabase
        .from('kp_guidance_schedule')
        .update({
          evidence_url: publicUrl,
          status: 'completed'
        })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      // Update kp_progress to increment guidance sessions completed
      const { data: currentProgress, error: fetchError } = await supabase
        .from('kp_progress')
        .select('guidance_sessions_completed')
        .eq('student_id', user?.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current progress:', fetchError);
      } else {
        const newCount = (currentProgress?.guidance_sessions_completed || 0) + 1;
        const { error: progressError } = await supabase
          .from('kp_progress')
          .update({ 
            guidance_sessions_completed: newCount,
            updated_at: new Date().toISOString()
          })
          .eq('student_id', user?.id);

        if (progressError) {
          console.error('Error updating progress:', progressError);
        }
      }

      toast.success('Bukti bimbingan berhasil diunggah! Sesi bimbingan Anda akan bertambah.');
      
      // Clear the file input
      setEvidenceFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[sessionId];
        return newFiles;
      });
      
      fetchGuidanceSessions();
    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast.error('Gagal mengunggah bukti bimbingan');
    } finally {
      setUploadingEvidence(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'approved':
        return 'bg-blue-500';
      case 'requested':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Selesai';
      case 'approved':
        return 'Disetujui';
      case 'requested':
        return 'Menunggu';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Jadwal Bimbingan</h2>
          <p className="text-gray-600">Kelola jadwal bimbingan KP Anda</p>
        </div>
        
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Ajukan Bimbingan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajukan Jadwal Bimbingan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requested_date">Tanggal & Waktu</Label>
                <Input
                  id="requested_date"
                  type="datetime-local"
                  value={formData.requested_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, requested_date: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="topic">Topik Bimbingan</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="Contoh: Diskusi BAB 1, Review proposal, dll"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Lokasi</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Contoh: Ruang dosen, Online (Zoom), dll"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Durasi (menit)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="30"
                  max="180"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Mengajukan...' : 'Ajukan Bimbingan'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowRequestDialog(false)}>
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada jadwal bimbingan</h3>
            <p className="text-gray-600 mb-4">
              Ajukan jadwal bimbingan pertama Anda dengan dosen pembimbing.
            </p>
          </div>
        ) : (
          sessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{session.topic}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(session.requested_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.duration_minutes} menit
                      </div>
                      {session.location && (
                        <span>📍 {session.location}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Pembimbing: {session.supervisor.full_name}
                    </p>
                  </div>
                  
                  <Badge className={getStatusColor(session.status)}>
                    {getStatusLabel(session.status)}
                  </Badge>
                </div>

                {session.supervisor_notes && (
                  <div className="bg-blue-50 p-3 rounded-md mb-4">
                    <p className="text-sm font-medium text-blue-900 mb-1">Catatan Pembimbing:</p>
                    <p className="text-sm text-blue-800">{session.supervisor_notes}</p>
                  </div>
                )}

                {/* Evidence Upload Section */}
                {session.status === 'approved' && !session.evidence_url && (
                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">
                        Upload bukti bimbingan untuk menambah sesi bimbingan:
                      </p>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setEvidenceFiles(prev => ({ ...prev, [session.id]: file }));
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleUploadEvidence(session.id)}
                          disabled={!evidenceFiles[session.id] || uploadingEvidence === session.id}
                          className="gap-2"
                        >
                          {uploadingEvidence === session.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          Upload
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Format yang didukung: JPG, PNG, PDF, DOC, DOCX (max 5MB)
                      </p>
                    </div>
                  </div>
                )}

                {/* Completed Evidence */}
                {session.status === 'completed' && session.evidence_url && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Bukti bimbingan telah diunggah</span>
                    </div>
                    <a
                      href={session.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <FileText className="h-4 w-4" />
                      Lihat bukti bimbingan
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default KpGuidanceSchedule;
