
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

      // Get teams supervised by this supervisor
      const { data: supervisorTeams, error: teamsError } = await supabase
        .from('team_supervisors')
        .select('team_id')
        .eq('supervisor_id', user.id);

      if (teamsError) throw teamsError;

      if (!supervisorTeams || supervisorTeams.length === 0) {
        setStudentsProgress([]);
        setTotalStudents(0);
        return;
      }

      const teamIds = supervisorTeams.map(t => t.team_id);

      // Get students in those teams
      const { data: teamMembers, error: membersError } = await supabase
        .from('team_members')
        .select(`
          user_id,
          profiles!team_members_user_id_fkey (
            id,
            full_name,
            nim
          )
        `)
        .in('team_id', teamIds);

      if (membersError) throw membersError;

      const studentIds = teamMembers?.map(tm => tm.user_id) || [];
      setTotalStudents(studentIds.length);

      if (studentIds.length === 0) {
        setStudentsProgress([]);
        return;
      }

      // Get progress data for students
      const { data: progressData, error: progressError } = await supabase
        .from('kp_progress')
        .select('*')
        .in('student_id', studentIds);

      if (progressError) throw progressError;

      // Get pending reviews count from kp_documents
      const { data: pendingDocs, error: docsError } = await supabase
        .from('kp_documents')
        .select('student_id')
        .in('student_id', studentIds)
        .eq('status', 'pending');

      if (docsError) throw docsError;

      // Get today's guidance sessions
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data: todayGuidance, error: guidanceError } = await supabase
        .from('kp_guidance_schedule')
        .select('student_id')
        .in('student_id', studentIds)
        .gte('requested_date', today)
        .lt('requested_date', tomorrow)
        .eq('status', 'approved');

      if (guidanceError) throw guidanceError;

      // Combine data
      const studentsWithProgress = teamMembers?.map(tm => {
        const profile = tm.profiles;
        const progress = progressData?.find(p => p.student_id === tm.user_id);
        const pendingReviews = pendingDocs?.filter(d => d.student_id === tm.user_id).length || 0;
        const hasTodayGuidance = todayGuidance?.some(g => g.student_id === tm.user_id) || false;

        return {
          student_id: tm.user_id,
          student_name: profile?.full_name || 'Unknown',
          current_stage: progress?.current_stage || 'proposal',
          overall_progress: progress?.overall_progress || 0,
          proposal_status: progress?.proposal_status || 'pending',
          guidance_sessions_completed: progress?.guidance_sessions_completed || 0,
          report_status: progress?.report_status || 'not_started',
          presentation_status: progress?.presentation_status || 'not_scheduled',
          last_activity: progress?.last_activity || progress?.created_at || '',
          pendingReviews,
          todayGuidance: hasTodayGuidance
        };
      }) || [];

      setStudentsProgress(studentsWithProgress);
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
