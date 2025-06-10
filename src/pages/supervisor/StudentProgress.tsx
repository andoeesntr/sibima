
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Users, TrendingUp, Clock } from 'lucide-react';

interface StudentProgressData {
  id: string;
  student_id: string;
  current_stage: string;
  overall_progress: number;
  guidance_sessions_completed: number;
  proposal_status: string;
  student: {
    full_name: string;
    nim: string;
  };
}

const StudentProgress = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentProgressData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProgressData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchStudentProgress();
    }
  }, [user?.id]);

  useEffect(() => {
    const filtered = students.filter(student => 
      student.student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student.nim.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const fetchStudentProgress = async () => {
    try {
      setLoading(true);
      
      // Get students that this supervisor is mentoring
      const { data: supervisorStudents, error: supervisorError } = await supabase
        .from('proposals')
        .select('student_id')
        .eq('supervisor_id', user?.id)
        .eq('status', 'approved');

      if (supervisorError) throw supervisorError;

      const studentIds = supervisorStudents?.map(p => p.student_id) || [];

      if (studentIds.length === 0) {
        setStudents([]);
        setFilteredStudents([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('kp_progress')
        .select(`
          *,
          student:profiles!kp_progress_student_id_fkey (
            full_name,
            nim
          )
        `)
        .in('student_id', studentIds)
        .order('overall_progress', { ascending: false });

      if (error) throw error;

      setStudents(data || []);
      setFilteredStudents(data || []);
    } catch (error) {
      console.error('Error fetching student progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageLabel = (stage: string) => {
    const stages = {
      proposal: 'Proposal',
      guidance: 'Bimbingan',
      report: 'Laporan',
      presentation: 'Sidang'
    };
    return stages[stage as keyof typeof stages] || stage;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'revision':
        return 'bg-orange-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Progress Mahasiswa Bimbingan</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Progress Mahasiswa Bimbingan</h1>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">{students.length} mahasiswa</span>
        </div>
      </div>

      {/* Search */}
      {students.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari mahasiswa (nama atau NIM)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Progress Cards */}
      <div className="grid gap-4">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{student.student.full_name}</CardTitle>
                  <p className="text-sm text-gray-600">NIM: {student.student.nim}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(student.proposal_status)}>
                    {student.proposal_status === 'approved' ? 'Disetujui' : 
                     student.proposal_status === 'pending' ? 'Menunggu' :
                     student.proposal_status === 'revision' ? 'Revisi' : 'Draft'}
                  </Badge>
                  <Badge variant="outline">
                    {getStageLabel(student.current_stage)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Overall Progress */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Progress Keseluruhan</span>
                  </div>
                  <Progress value={student.overall_progress} className="h-2 mb-1" />
                  <p className="text-xs text-gray-600">{student.overall_progress}% selesai</p>
                </div>

                {/* Guidance Sessions */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Sesi Bimbingan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{student.guidance_sessions_completed}</span>
                    <span className="text-sm text-gray-600">/ 8 sesi</span>
                  </div>
                  <Progress 
                    value={(student.guidance_sessions_completed / 8) * 100} 
                    className="h-2 mt-1" 
                  />
                </div>

                {/* Current Stage */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Tahap Saat Ini</span>
                  </div>
                  <p className="text-lg font-semibold text-primary">
                    {getStageLabel(student.current_stage)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {student.current_stage === 'proposal' && 'Proses pengajuan proposal'}
                    {student.current_stage === 'guidance' && 'Masa bimbingan berlangsung'}
                    {student.current_stage === 'report' && 'Penyusunan laporan'}
                    {student.current_stage === 'presentation' && 'Persiapan sidang'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Mahasiswa tidak ditemukan' : 'Belum ada mahasiswa bimbingan'}
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Coba kata kunci pencarian yang berbeda.' : 'Mahasiswa akan muncul setelah proposal mereka disetujui dan Anda ditetapkan sebagai pembimbing.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentProgress;
