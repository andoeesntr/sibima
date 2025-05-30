
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, CheckCircle, XCircle, MessageSquare, User, Filter } from 'lucide-react';
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
  const [filteredRequests, setFilteredRequests] = useState<GuidanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched guidance requests for supervisor:', data);
      setGuidanceRequests(data || []);
      setFilteredRequests(data || []);
    } catch (error) {
      console.error('Error fetching guidance requests:', error);
      toast.error('Gagal memuat permintaan bimbingan');
    } finally {
      setLoading(false);
    }
  };

  // Filter function
  const applyFilters = () => {
    let filtered = [...guidanceRequests];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Filter by student
    if (studentFilter !== 'all') {
      filtered = filtered.filter(request => request.student_id === studentFilter);
    }

    setFilteredRequests(filtered);
  };

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [statusFilter, studentFilter, guidanceRequests]);

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

  // Get unique students for filter
  const uniqueStudents = guidanceRequests.reduce((acc, request) => {
    if (request.student && !acc.find(s => s.id === request.student_id)) {
      acc.push({
        id: request.student_id,
        name: request.student.full_name,
        nim: request.student.nim
      });
    }
    return acc;
  }, [] as Array<{ id: string; name: string; nim: string }>);

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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-4 w-4" />
            Filter Jadwal Bimbingan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="requested">Menunggu</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Mahasiswa</label>
              <Select value={studentFilter} onValueChange={setStudentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mahasiswa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Mahasiswa</SelectItem>
                  {uniqueStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.nim})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">
              {guidanceRequests.length === 0 
                ? "Belum ada permintaan bimbingan dari mahasiswa" 
                : "Tidak ada permintaan yang sesuai dengan filter"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Menampilkan {filteredRequests.length} dari {guidanceRequests.length} permintaan
            </p>
          </div>
          
          {filteredRequests.map((request) => (
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
