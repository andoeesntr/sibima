
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
            guidance_sessions_completed: 0,
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
        setProgressData(existingProgress);
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
