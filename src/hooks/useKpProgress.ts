
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
    console.log('Calculating guidance progress for student:', studentId);
    
    // Count approved journal entries (these represent completed guidance sessions)
    const { data: approvedJournalEntries, error: journalError } = await supabase
      .from('kp_journal_entries')
      .select('id, entry_date, status')
      .eq('student_id', studentId)
      .eq('status', 'approved');

    if (journalError) {
      console.error('Error fetching journal entries:', journalError);
    }

    // Count completed guidance sessions from schedule
    const { data: completedGuidanceSessions, error: scheduleError } = await supabase
      .from('kp_guidance_schedule')
      .select('id, requested_date, status')
      .eq('student_id', studentId)
      .eq('status', 'completed');

    if (scheduleError) {
      console.error('Error fetching guidance sessions:', scheduleError);
    }

    // Count all journal entries (including draft) as they represent actual sessions
    const { data: allJournalEntries, error: allJournalError } = await supabase
      .from('kp_journal_entries')
      .select('id, entry_date, status')
      .eq('student_id', studentId);

    if (allJournalError) {
      console.error('Error fetching all journal entries:', allJournalError);
    }

    const approvedJournalCount = approvedJournalEntries?.length || 0;
    const completedSessionCount = completedGuidanceSessions?.length || 0;
    const totalJournalCount = allJournalEntries?.length || 0;
    
    console.log('Guidance progress calculation:', {
      approvedJournalCount,
      completedSessionCount,
      totalJournalCount
    });
    
    // Return the count that best represents actual guidance sessions
    // Priority: approved journals > all journals > completed sessions
    const actualSessions = Math.max(approvedJournalCount, totalJournalCount, completedSessionCount);
    
    console.log('Final guidance sessions count:', actualSessions);
    return actualSessions;
  };

  const fetchProgressData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      console.log('Fetching progress data for user:', user.id);
      
      // Calculate actual guidance sessions completed
      const actualGuidanceSessions = await calculateGuidanceProgress(user.id);
      
      // First check if progress record exists
      let { data: existingProgress, error: fetchError } = await supabase
        .from('kp_progress')
        .select('*')
        .eq('student_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching progress:', fetchError);
        throw fetchError;
      }

      console.log('Existing progress:', existingProgress);

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
            presentation_status: 'not_scheduled',
            last_activity: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating progress:', createError);
          throw createError;
        }

        console.log('Created new progress:', newProgress);
        setProgressData(newProgress);
      } else {
        // Always update guidance sessions count and progress
        let newOverallProgress = existingProgress.overall_progress;
        let newCurrentStage = existingProgress.current_stage;
        
        // Update progress based on guidance sessions
        if (actualGuidanceSessions >= 8) {
          newOverallProgress = Math.max(newOverallProgress, 50); // 25% proposal + 25% guidance
          if (newCurrentStage === 'guidance') {
            newCurrentStage = 'report'; // Move to next stage
          }
        } else if (actualGuidanceSessions > 0 && existingProgress.proposal_status === 'approved') {
          newOverallProgress = Math.max(newOverallProgress, 25 + Math.floor((actualGuidanceSessions / 8) * 25));
        }

        console.log('Updating progress:', {
          currentSessions: existingProgress.guidance_sessions_completed,
          newSessions: actualGuidanceSessions,
          currentProgress: existingProgress.overall_progress,
          newProgress: newOverallProgress,
          currentStage: existingProgress.current_stage,
          newStage: newCurrentStage
        });

        const { data: updatedProgress, error: updateError } = await supabase
          .from('kp_progress')
          .update({
            guidance_sessions_completed: actualGuidanceSessions,
            overall_progress: newOverallProgress,
            current_stage: newCurrentStage,
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('student_id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating progress:', updateError);
          throw updateError;
        }

        console.log('Updated progress:', updatedProgress);
        setProgressData(updatedProgress);
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
