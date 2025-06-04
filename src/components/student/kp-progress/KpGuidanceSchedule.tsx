import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useStudentDashboard } from '@/hooks/useStudentDashboard';
import GuidanceRequestForm from './GuidanceRequestForm';

interface GuidanceSession {
  id: string;
  supervisor_id: string;
  requested_date: string;
  duration_minutes: number;
  location?: string;
  topic?: string;
  status: string;
  meeting_link?: string;
  supervisor_notes?: string;
  supervisor?: {
    full_name: string;
  };
}

const KpGuidanceSchedule = () => {
  const [sessions, setSessions] = useState<GuidanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { selectedProposal, proposals } = useStudentDashboard();

  const fetchGuidanceSessions = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kp_guidance_schedule')
        .select(`
          *,
          supervisor:profiles!kp_guidance_schedule_supervisor_id_fkey (
            full_name
          )
        `)
        .eq('student_id', user.id)
        .order('requested_date', { ascending: false });

      if (error) throw error;

      console.log('Fetched guidance sessions:', data);
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching guidance sessions:', error);
      toast.error('Gagal memuat jadwal bimbingan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Disetujui</span>;
      case 'requested':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Menunggu</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Ditolak</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Selesai</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchGuidanceSessions();
  }, [user?.id]);

  // Check if student has approved proposal and supervisors
  const hasApprovedProposal = proposals.some(p => p.status === 'approved');
  const hasSupervisors = selectedProposal?.supervisors && selectedProposal.supervisors.length > 0;

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
        <h2 className="text-xl font-semibold">Kalender Bimbingan</h2>
        <p className="text-gray-600">Jadwalkan sesi bimbingan dengan dosen pembimbing</p>
      </div>

      {/* Display supervisors info */}
      {hasSupervisors && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-blue-800">
              Dosen Pembimbing: {selectedProposal?.supervisors?.map(s => s.full_name).join(', ')}
            </p>
          </CardContent>
        </Card>
      )}

      {!hasApprovedProposal || !hasSupervisors ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Dosen Pembimbing</h3>
            <p className="text-gray-600 text-center mb-4">
              {!hasApprovedProposal 
                ? "Proposal Anda belum disetujui. Tunggu persetujuan koordinator."
                : "Anda belum memiliki dosen pembimbing. Tunggu penugasan dari koordinator."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Guidance Request Form */}
          <GuidanceRequestForm />

          {/* Existing Sessions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Riwayat Pengajuan Bimbingan</h3>
            
            {sessions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pengajuan bimbingan</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Anda belum mengajukan sesi bimbingan. Gunakan form di atas untuk mengajukan bimbingan.
                  </p>
                </CardContent>
              </Card>
            ) : (
              sessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{formatDate(session.requested_date)}</span>
                          {getStatusBadge(session.status)}
                        </div>
                        
                        {session.topic && (
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{session.topic}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{session.duration_minutes || 60} menit</span>
                        </div>
                        
                        {session.location && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{session.location}</span>
                          </div>
                        )}
                        
                        <div className="text-sm text-gray-600">
                          Pembimbing: {session.supervisor?.full_name || 'Unknown'}
                        </div>
                        
                        {session.supervisor_notes && (
                          <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p className="text-sm text-blue-700">
                              <strong>Catatan Pembimbing:</strong> {session.supervisor_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default KpGuidanceSchedule;
