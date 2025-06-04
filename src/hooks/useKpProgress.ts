
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface KpProgressData {
  id: string;
  student_id: string;
  current_stage: string;
  overall_progress: number;
  proposal_status: string;
  guidance_sessions_completed: number;
  report_status: string;
  presentation_status: string;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export const useKpProgress = () => {
  const [progressData, setProgressData] = useState<KpProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const calculateGuidanceProgress = async (studentId: string) => {
    // Count completed journal entries
    const { data: journalEntries } = await supabase
      .from('kp_journal_entries')
      .select('id')
      .eq('student_id', studentId)
      .eq('status', 'approved');

    // Count completed guidance sessions
    const { data: guidanceSessions } = await supabase
      .from('kp_guidance_schedule')
      .select('id')
      .eq('student_id', studentId)
      .eq('status', 'completed');

    const journalCount = journalEntries?.length || 0;
    const sessionCount = guidanceSessions?.length || 0;
    
    // Take the higher count between journal entries and guidance sessions
    return Math.max(journalCount, sessionCount);
  };

  const fetchProgressData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // First check if progress record exists
      let { data: existingProgress, error: fetchError } = await supabase
        .from('kp_progress')
        .select('*')
        .eq('student_id', user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      // Calculate actual guidance sessions completed
      const actualGuidanceSessions = await calculateGuidanceProgress(user.id);

      // If no progress record exists, create one
      if (!existingProgress) {
        // Check if user has approved proposals to set initial progress correctly
        const { data: approvedProposal } = await supabase
          .from('proposals')
          .select('status')
          .eq('student_id', user.id)
          .eq('status', 'approved')
          .maybeSingle();

        const initialProgress = approvedProposal ? 25 : 0;
        const initialStage = approvedProposal ? 'guidance' : 'proposal';
        const initialProposalStatus = approvedProposal ? 'approved' : 'pending';

        const { data: newProgress, error: createError } = await supabase
          .from('kp_progress')
          .insert({
            student_id: user.id,
            current_stage: initialStage,
            overall_progress: initialProgress,
            proposal_status: initialProposalStatus,
            guidance_sessions_completed: actualGuidanceSessions,
            report_status: 'not_started',
            presentation_status: 'not_scheduled'
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        setProgressData(newProgress);
      } else {
        // Update guidance sessions count if different
        if (existingProgress.guidance_sessions_completed !== actualGuidanceSessions) {
          // Calculate new overall progress
          let newOverallProgress = existingProgress.overall_progress;
          
          // Add guidance progress (25% for completing guidance phase)
          if (actualGuidanceSessions >= 8 && existingProgress.guidance_sessions_completed < 8) {
            newOverallProgress = Math.max(newOverallProgress, 50); // 25% proposal + 25% guidance
          }

          const { data: updatedProgress, error: updateError } = await supabase
            .from('kp_progress')
            .update({
              guidance_sessions_completed: actualGuidanceSessions,
              overall_progress: newOverallProgress,
              updated_at: new Date().toISOString()
            })
            .eq('student_id', user.id)
            .select()
            .single();

          if (updateError) {
            throw updateError;
          }

          setProgressData(updatedProgress);
        } else {
          setProgressData(existingProgress);
        }
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
      toast.error('Gagal mengambil data progress');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<KpProgressData>) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('kp_progress')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProgressData(data);
      toast.success('Progress berhasil diperbarui');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Gagal memperbarui progress');
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, [user?.id]);

  return {
    progressData,
    loading,
    updateProgress,
    refetch: fetchProgressData
  };
};
