import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Clock, MapPin, MessageSquare, Plus, Filter, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useStudentDashboard } from '@/hooks/useStudentDashboard';
import GuidanceRequestDialog from './GuidanceRequestDialog';

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
  created_at: string;
  supervisor?: {
    full_name: string;
  };
}

const KpGuidanceSchedule = () => {
  const [sessions, setSessions] = useState<GuidanceSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<GuidanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supervisorFilter, setSupervisorFilter] = useState<string>('all');
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched guidance sessions:', data);
      setSessions(data || []);
      setFilteredSessions(data || []);
    } catch (error) {
      console.error('Error fetching guidance sessions:', error);
      toast.error('Gagal memuat jadwal bimbingan');
    } finally {
      setLoading(false);
    }
  };

  // Filter function
  const applyFilters = () => {
    let filtered = [...sessions];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    // Filter by supervisor
    if (supervisorFilter !== 'all') {
      filtered = filtered.filter(session => session.supervisor_id === supervisorFilter);
    }

    setFilteredSessions(filtered);
  };

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [statusFilter, supervisorFilter, sessions]);

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

  // Get unique supervisors for filter
  const uniqueSupervisors = sessions.reduce((acc, session) => {
    if (session.supervisor && !acc.find(s => s.id === session.supervisor_id)) {
      acc.push({
        id: session.supervisor_id,
        name: session.supervisor.full_name
      });
    }
    return acc;
  }, [] as Array<{ id: string; name: string }>);

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Kalender Bimbingan</h2>
          <p className="text-gray-600">Jadwalkan sesi bimbingan dengan dosen pembimbing</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Compact Filters - only show if there are sessions */}
          {sessions.length > 0 && (
            <>
              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Status
                    {statusFilter !== 'all' && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {statusFilter === 'requested' ? 'Menunggu' : 
                         statusFilter === 'approved' ? 'Disetujui' : 
                         statusFilter === 'rejected' ? 'Ditolak' : 'Selesai'}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    Semua Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('requested')}>
                    Menunggu
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('approved')}>
                    Disetujui
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>
                    Ditolak
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                    Selesai
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Supervisor Filter - only if multiple supervisors */}
              {uniqueSupervisors.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      Dosen
                      {supervisorFilter !== 'all' && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {uniqueSupervisors.find(s => s.id === supervisorFilter)?.name}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setSupervisorFilter('all')}>
                      Semua Dosen
                    </DropdownMenuItem>
                    {uniqueSupervisors.map((supervisor) => (
                      <DropdownMenuItem key={supervisor.id} onClick={() => setSupervisorFilter(supervisor.id)}>
                        {supervisor.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}

          {hasApprovedProposal && hasSupervisors && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajukan Bimbingan
            </Button>
          )}
        </div>
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
          {/* Existing Sessions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Riwayat Pengajuan Bimbingan</h3>
              {filteredSessions.length > 0 && sessions.length > filteredSessions.length && (
                <p className="text-sm text-gray-600">
                  Menampilkan {filteredSessions.length} dari {sessions.length} pengajuan
                </p>
              )}
            </div>
            
            {filteredSessions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {sessions.length === 0 
                      ? "Belum ada pengajuan bimbingan" 
                      : "Tidak ada pengajuan yang sesuai dengan filter"
                    }
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    {sessions.length === 0 
                      ? "Anda belum mengajukan sesi bimbingan. Klik tombol \"Ajukan Bimbingan\" untuk mengajukan."
                      : "Coba ubah filter untuk melihat pengajuan lainnya."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredSessions.map((session) => (
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

                        <div className="text-xs text-gray-500 pt-2 border-t">
                          Diajukan pada: {new Date(session.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* Guidance Request Dialog */}
      <GuidanceRequestDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmitSuccess={() => {
          setIsDialogOpen(false);
          fetchGuidanceSessions();
        }}
      />
    </div>
  );
};

export default KpGuidanceSchedule;
