
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface StudentProgressData {
  student_id: string;
  student_name: string;
  current_stage: string;
  overall_progress: number;
  proposal_status: string;
  guidance_sessions_completed: number;
  report_status: string;
  presentation_status: string;
  last_activity: string;
  pendingReviews: number;
  todayGuidance: boolean;
}

export const useSupervisorKpProgress = () => {
  const [studentsProgress, setStudentsProgress] = useState<StudentProgressData[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStudentsProgress = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get students supervised by this supervisor
      const { data: supervisedStudents, error: studentsError } = await supabase
        .from('team_supervisors')
        .select(`
          team_id,
          teams!inner (
            id,
            team_members!inner (
              user_id,
              profiles!inner (
                id,
                full_name
              )
            )
          )
        `)
        .eq('supervisor_id', user.id);

      if (studentsError) throw studentsError;

      // Extract unique student IDs
      const studentIds = new Set<string>();
      const studentNames: { [key: string]: string } = {};

      supervisedStudents?.forEach(team => {
        team.teams.team_members.forEach(member => {
          studentIds.add(member.user_id);
          studentNames[member.user_id] = member.profiles.full_name;
        });
      });

      setTotalStudents(studentIds.size);

      // Get progress data for each student
      const progressPromises = Array.from(studentIds).map(async (studentId) => {
        const { data: progress } = await supabase
          .from('kp_progress')
          .select('*')
          .eq('student_id', studentId)
          .maybeSingle();

        // Count pending reviews (documents and journal entries)
        const { count: pendingDocs } = await supabase
          .from('kp_documents')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', studentId)
          .eq('status', 'pending');

        const { count: pendingJournals } = await supabase
          .from('kp_journal_entries')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', studentId)
          .eq('status', 'draft');

        // Check for today's guidance sessions
        const today = new Date().toISOString().split('T')[0];
        const { data: todayGuidance } = await supabase
          .from('kp_guidance_schedule')
          .select('*')
          .eq('student_id', studentId)
          .eq('supervisor_id', user.id)
          .gte('requested_date', today)
          .lt('requested_date', `${today}T23:59:59`)
          .eq('status', 'approved');

        return {
          student_id: studentId,
          student_name: studentNames[studentId],
          current_stage: progress?.current_stage || 'proposal',
          overall_progress: progress?.overall_progress || 0,
          proposal_status: progress?.proposal_status || 'pending',
          guidance_sessions_completed: progress?.guidance_sessions_completed || 0,
          report_status: progress?.report_status || 'not_started',
          presentation_status: progress?.presentation_status || 'not_scheduled',
          last_activity: progress?.last_activity || '',
          pendingReviews: (pendingDocs || 0) + (pendingJournals || 0),
          todayGuidance: (todayGuidance?.length || 0) > 0
        };
      });

      const progressData = await Promise.all(progressPromises);
      setStudentsProgress(progressData);

    } catch (error) {
      console.error('Error fetching students progress:', error);
      toast.error('Gagal mengambil data progress mahasiswa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsProgress();
  }, [user?.id]);

  return {
    studentsProgress,
    totalStudents,
    loading,
    refetch: fetchStudentsProgress
  };
};
