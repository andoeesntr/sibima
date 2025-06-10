
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, BookOpen, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface StudentProgress {
  id: string;
  student_id: string;
  current_stage: string;
  overall_progress: number;
  guidance_sessions_completed: number;
  proposal_status: string;
  report_status: string;
  presentation_status: string;
  last_activity: string;
  student: {
    full_name: string;
    nim: string;
    email: string;
  };
}

const SupervisorProgressOverview = () => {
  const { user } = useAuth();
  const [studentsProgress, setStudentsProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchStudentsProgress();
    }
  }, [user?.id]);

  const fetchStudentsProgress = async () => {
    try {
      setLoading(true);

      // First get students assigned to this supervisor through guidance schedule
      const { data: guidanceData, error: guidanceError } = await supabase
        .from('kp_guidance_schedule')
        .select(`
          student_id,
          student:profiles!kp_guidance_schedule_student_id_fkey (
            id,
            full_name,
            nim,
            email
          )
        `)
        .eq('supervisor_id', user?.id);

      if (guidanceError) {
        console.error('Error fetching guidance data:', guidanceError);
      }

      // Also get students through proposals
      const { data: proposalData, error: proposalError } = await supabase
        .from('proposals')
        .select(`
          student_id,
          student:profiles!proposals_student_id_fkey (
            id,
            full_name,
            nim,
            email
          )
        `)
        .eq('supervisor_id', user?.id)
        .not('student_id', 'is', null);

      if (proposalError) {
        console.error('Error fetching proposal data:', proposalError);
      }

      // Combine and deduplicate student IDs
      const allStudents = new Map();
      
      if (guidanceData) {
        guidanceData.forEach(item => {
          if (item.student && item.student_id) {
            allStudents.set(item.student_id, item.student);
          }
        });
      }

      if (proposalData) {
        proposalData.forEach(item => {
          if (item.student && item.student_id) {
            allStudents.set(item.student_id, item.student);
          }
        });
      }

      const studentIds = Array.from(allStudents.keys());

      if (studentIds.length === 0) {
        setStudentsProgress([]);
        return;
      }

      // Get progress data for all students
      const { data: progressData, error: progressError } = await supabase
        .from('kp_progress')
        .select('*')
        .in('student_id', studentIds);

      if (progressError) {
        console.error('Error fetching progress data:', progressError);
        throw progressError;
      }

      // Combine student info with progress data
      const combinedData: StudentProgress[] = [];

      allStudents.forEach((student, studentId) => {
        const progress = progressData?.find(p => p.student_id === studentId);
        
        combinedData.push({
          id: progress?.id || '',
          student_id: studentId,
          current_stage: progress?.current_stage || 'proposal',
          overall_progress: progress?.overall_progress || 0,
          guidance_sessions_completed: progress?.guidance_sessions_completed || 0,
          proposal_status: progress?.proposal_status || 'pending',
          report_status: progress?.report_status || 'not_started',
          presentation_status: progress?.presentation_status || 'not_scheduled',
          last_activity: progress?.last_activity || '',
          student: {
            full_name: student.full_name || '',
            nim: student.nim || '',
            email: student.email || ''
          }
        });
      });

      setStudentsProgress(combinedData);
    } catch (error) {
      console.error('Error fetching students progress:', error);
      toast.error('Gagal memuat data progress mahasiswa');
    } finally {
      setLoading(false);
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'proposal':
        return 'Proposal';
      case 'guidance':
        return 'Bimbingan';
      case 'report':
        return 'Laporan';
      case 'presentation':
        return 'Presentasi';
      default:
        return stage;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
      case 'ongoing':
        return 'bg-blue-500';
      case 'pending':
      case 'submitted':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Disetujui';
      case 'completed':
        return 'Selesai';
      case 'in_progress':
        return 'Sedang Berlangsung';
      case 'ongoing':
        return 'Berlangsung';
      case 'pending':
        return 'Menunggu';
      case 'submitted':
        return 'Diajukan';
      case 'rejected':
        return 'Ditolak';
      case 'not_started':
        return 'Belum Dimulai';
      case 'not_scheduled':
        return 'Belum Dijadwalkan';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (studentsProgress.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada mahasiswa bimbingan</h3>
        <p className="text-gray-600">
          Mahasiswa yang Anda bimbing akan muncul di sini setelah mereka mengajukan bimbingan atau proposal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Progress Mahasiswa Bimbingan</h2>
        <p className="text-gray-600">
          Pantau progress KP dari {studentsProgress.length} mahasiswa bimbingan Anda
        </p>
      </div>

      <div className="grid gap-6">
        {studentsProgress.map((progress) => (
          <Card key={progress.student_id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{progress.student.full_name}</CardTitle>
                  <p className="text-sm text-gray-600">{progress.student.nim}</p>
                  <p className="text-sm text-gray-500">{progress.student.email}</p>
                </div>
                <Badge className={getStatusColor(progress.current_stage)}>
                  {getStageLabel(progress.current_stage)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress Keseluruhan</span>
                  <span className="text-sm text-gray-600">{progress.overall_progress}%</span>
                </div>
                <Progress value={progress.overall_progress} className="h-2" />
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Proposal</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(progress.proposal_status)} text-white border-0`}
                  >
                    {getStatusLabel(progress.proposal_status)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Bimbingan</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {progress.guidance_sessions_completed} sesi selesai
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Laporan</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(progress.report_status)} text-white border-0`}
                  >
                    {getStatusLabel(progress.report_status)}
                  </Badge>
                </div>
              </div>

              {/* Last Activity */}
              {progress.last_activity && (
                <div className="text-xs text-gray-500 pt-2 border-t">
                  Aktivitas terakhir: {new Date(progress.last_activity).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SupervisorProgressOverview;
