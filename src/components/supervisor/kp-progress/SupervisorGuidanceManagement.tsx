
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, CheckCircle, XCircle, MessageSquare, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface GuidanceRequest {
  id: string;
  student_id: string;
  requested_date: string;
  duration_minutes: number;
  location?: string;
  topic?: string;
  status: string;
  meeting_link?: string;
  supervisor_notes?: string;
  created_at: string;
  student: {
    full_name: string;
    nim: string;
  } | null;
}

const SupervisorGuidanceManagement = () => {
  const [guidanceRequests, setGuidanceRequests] = useState<GuidanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGuidanceRequests = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kp_guidance_schedule')
        .select(`
          *,
          student:profiles!kp_guidance_schedule_student_id_fkey (
            full_name,
            nim
          )
        `)
        .eq('supervisor_id', user.id)
        .order('requested_date', { ascending: false });

      if (error) throw error;

      console.log('Fetched guidance requests for supervisor:', data);
      setGuidanceRequests(data || []);
    } catch (error) {
      console.error('Error fetching guidance requests:', error);
      toast.error('Gagal memuat permintaan bimbingan');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('kp_guidance_schedule')
        .update({ 
          status,
          supervisor_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(`Permintaan bimbingan ${status === 'approved' ? 'disetujui' : 'ditolak'}`);
      fetchGuidanceRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Gagal mengupdate status permintaan');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      requested: { label: 'Menunggu', className: 'bg-yellow-500' },
      approved: { label: 'Disetujui', className: 'bg-green-500' },
      rejected: { label: 'Ditolak', className: 'bg-red-500' },
      completed: { label: 'Selesai', className: 'bg-blue-500' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.requested;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy HH:mm', { locale: id });
  };

  useEffect(() => {
    fetchGuidanceRequests();
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
        <h2 className="text-xl font-semibold">Manajemen Jadwal Bimbingan</h2>
        <p className="text-gray-600">Kelola jadwal dan approve permintaan bimbingan dari mahasiswa</p>
      </div>

      {guidanceRequests.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Belum ada permintaan bimbingan dari mahasiswa</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {guidanceRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-4 w-4" />
                      {request.student?.full_name || 'Unknown Student'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span>NIM: {request.student?.nim || 'Unknown'}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(request.requested_date)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{request.duration_minutes || 60} menit</span>
                    </div>
                    
                    {request.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{request.location}</span>
                      </div>
                    )}
                  </div>

                  {request.topic && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-sm">Topik Bimbingan:</span>
                      </div>
                      <p className="text-sm text-gray-700 ml-6">{request.topic}</p>
                    </div>
                  )}

                  {request.supervisor_notes && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-blue-800">Catatan Anda:</h4>
                      <p className="text-blue-700 text-sm whitespace-pre-wrap">{request.supervisor_notes}</p>
                    </div>
                  )}

                  {request.status === 'requested' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        onClick={() => updateRequestStatus(request.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Setujui
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => updateRequestStatus(request.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Tolak
                      </Button>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Diajukan pada: {format(new Date(request.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupervisorGuidanceManagement;
