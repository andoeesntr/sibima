
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface StudentProgress {
  id: string;
  full_name: string;
  nim: string;
  overall_progress: number;
  current_stage: string;
  guidance_sessions_completed: number;
  last_activity: string;
  pendingReviews: number;
  todayGuidance: boolean;
}

export const useSupervisorKpProgress = () => {
  const [studentsProgress, setStudentsProgress] = useState<StudentProgress[]>([]);
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

      // Get pending reviews count
      const { data: pendingDocs, error: docsError } = await supabase
        .from('kp_documents')
        .select('student_id')
        .in('student_id', studentIds)
        .eq('status', 'pending');

      if (docsError) throw docsError;

      // Get today's guidance sessions
      const today = new Date().toISOString().split('T')[0];
      const { data: todayGuidance, error: guidanceError } = await supabase
        .from('kp_guidance_schedule')
        .select('student_id')
        .in('student_id', studentIds)
        .gte('requested_date', today)
        .lt('requested_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
        .eq('status', 'approved');

      if (guidanceError) throw guidanceError;

      // Combine data
      const studentsWithProgress = teamMembers?.map(tm => {
        const profile = tm.profiles;
        const progress = progressData?.find(p => p.student_id === tm.user_id);
        const pendingReviews = pendingDocs?.filter(d => d.student_id === tm.user_id).length || 0;
        const hasTodayGuidance = todayGuidance?.some(g => g.student_id === tm.user_id) || false;

        return {
          id: tm.user_id,
          full_name: profile?.full_name || 'Unknown',
          nim: profile?.nim || '',
          overall_progress: progress?.overall_progress || 0,
          current_stage: progress?.current_stage || 'proposal',
          guidance_sessions_completed: progress?.guidance_sessions_completed || 0,
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
