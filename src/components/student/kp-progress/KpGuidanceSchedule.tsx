import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Video, Plus, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface GuidanceSchedule {
  id: string;
  requested_date: string;
  duration_minutes: number;
  topic: string | null;
  status: string;
  meeting_link: string | null;
  location: string | null;
  supervisor_notes: string | null;
  created_at: string;
  supervisor: {
    full_name: string;
  };
}

const KpGuidanceSchedule = () => {
  const [schedules, setSchedules] = useState<GuidanceSchedule[]>([]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const { user } = useAuth();

  const [newRequest, setNewRequest] = useState({
    supervisor_id: '',
    requested_date: '',
    duration_minutes: 60,
    topic: '',
    location: ''
  });

  const fetchSchedules = async () => {
    if (!user?.id) return;

    try {
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
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Gagal mengambil data jadwal');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisors = async () => {
    if (!user?.id) return;

    try {
      // First, get the user's team
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .single();

      if (teamError || !teamMember) {
        console.log('No team found for user');
        return;
      }

      // Then get supervisors for that team
      const { data: teamSupervisors, error: supervisorError } = await supabase
        .from('team_supervisors')
        .select('supervisor_id')
        .eq('team_id', teamMember.team_id);

      if (supervisorError) throw supervisorError;

      if (teamSupervisors && teamSupervisors.length > 0) {
        // Get supervisor details from profiles table
        const supervisorIds = teamSupervisors.map(ts => ts.supervisor_id);
        
        const { data: supervisorProfiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', supervisorIds);

        if (profileError) throw profileError;

        const supervisorsList = supervisorProfiles?.map(profile => ({
          id: profile.id,
          full_name: profile.full_name || 'Unknown'
        })) || [];

        setSupervisors(supervisorsList);
        
        // Set default supervisor if only one
        if (supervisorsList.length === 1) {
          setNewRequest(prev => ({ ...prev, supervisor_id: supervisorsList[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    }
  };

  const handleRequestGuidance = async () => {
    if (!user?.id || !newRequest.supervisor_id) {
      toast.error('Pilih dosen pembimbing terlebih dahulu');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('kp_guidance_schedule')
        .insert({
          student_id: user.id,
          supervisor_id: newRequest.supervisor_id,
          requested_date: newRequest.requested_date,
          duration_minutes: newRequest.duration_minutes,
          topic: newRequest.topic,
          location: newRequest.location,
          status: 'requested'
        })
        .select(`
          *,
          supervisor:profiles!kp_guidance_schedule_supervisor_id_fkey (
            full_name
          )
        `)
        .single();

      if (error) throw error;

      setSchedules(prev => [data, ...prev]);
      setNewRequest({
        supervisor_id: supervisors.length === 1 ? supervisors[0].id : '',
        requested_date: '',
        duration_minutes: 60,
        topic: '',
        location: ''
      });
      setIsRequesting(false);
      toast.success('Permintaan bimbingan berhasil dikirim');
    } catch (error) {
      console.error('Error requesting guidance:', error);
      toast.error('Gagal mengirim permintaan bimbingan');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      requested: { label: 'Menunggu Persetujuan', className: 'bg-yellow-500' },
      approved: { label: 'Disetujui', className: 'bg-green-500' },
      rejected: { label: 'Ditolak', className: 'bg-red-500' },
      completed: { label: 'Selesai', className: 'bg-blue-500' },
      cancelled: { label: 'Dibatalkan', className: 'bg-gray-500' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.requested;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2); // Minimum 2 hours from now
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    fetchSchedules();
    fetchSupervisors();
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Kalender Bimbingan</h2>
          <p className="text-gray-600">Jadwalkan sesi bimbingan dengan dosen pembimbing</p>
        </div>
        <Button 
          onClick={() => setIsRequesting(true)} 
          disabled={supervisors.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Request Bimbingan
        </Button>
      </div>

      {supervisors.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800">
              Anda belum memiliki dosen pembimbing. Silakan ajukan proposal terlebih dahulu.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Request Form */}
      {isRequesting && (
        <Card>
          <CardHeader>
            <CardTitle>Request Bimbingan Baru</CardTitle>
            <CardDescription>
              Isi form di bawah untuk mengajukan jadwal bimbingan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supervisors.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="supervisor">Dosen Pembimbing</Label>
                <select
                  id="supervisor"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newRequest.supervisor_id}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, supervisor_id: e.target.value }))}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requested_date">Tanggal & Waktu</Label>
                <Input
                  id="requested_date"
                  type="datetime-local"
                  min={getMinDateTime()}
                  value={newRequest.requested_date}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, requested_date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Durasi (menit)</Label>
                <select
                  id="duration"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newRequest.duration_minutes}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                >
                  <option value={30}>30 menit</option>
                  <option value={60}>60 menit</option>
                  <option value={90}>90 menit</option>
                  <option value={120}>120 menit</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topik Bimbingan</Label>
              <Input
                id="topic"
                placeholder="Masukkan topik yang akan dibahas..."
                value={newRequest.topic}
                onChange={(e) => setNewRequest(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokasi (Opsional)</Label>
              <Input
                id="location"
                placeholder="Ruang, Lab, atau Online"
                value={newRequest.location}
                onChange={(e) => setNewRequest(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleRequestGuidance} 
                disabled={!newRequest.requested_date || !newRequest.supervisor_id}
              >
                Kirim Permintaan
              </Button>
              <Button variant="outline" onClick={() => setIsRequesting(false)}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedules List */}
      <div className="space-y-4">
        {schedules.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Belum ada jadwal bimbingan</p>
            </CardContent>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {format(new Date(schedule.requested_date), 'dd MMMM yyyy', { locale: id })}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(schedule.requested_date), 'HH:mm', { locale: id })} 
                        ({schedule.duration_minutes} menit)
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {schedule.supervisor?.full_name || 'Unknown Supervisor'}
                      </span>
                    </CardDescription>
                  </div>
                  {getStatusBadge(schedule.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedule.topic && (
                    <div>
                      <h4 className="font-medium text-sm">Topik:</h4>
                      <p className="text-gray-700">{schedule.topic}</p>
                    </div>
                  )}

                  {schedule.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{schedule.location}</span>
                    </div>
                  )}

                  {schedule.meeting_link && (
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-blue-500" />
                      <a 
                        href={schedule.meeting_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Join Meeting
                      </a>
                    </div>
                  )}

                  {schedule.supervisor_notes && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-800 text-sm mb-1">Catatan Dosen:</h4>
                      <p className="text-blue-700 text-sm whitespace-pre-wrap">{schedule.supervisor_notes}</p>
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

export default KpGuidanceSchedule;
