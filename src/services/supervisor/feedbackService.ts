
import { supabase } from '@/integrations/supabase/client';
import { FeedbackEntry } from '@/types/supervisorProposals';
import { toast } from 'sonner';

// Fetch feedback for a proposal
export const fetchProposalFeedback = async (proposalId: string): Promise<FeedbackEntry[]> => {
  try {
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('proposal_feedback')
      .select('id, content, created_at, supervisor_id')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: false });
      
    if (feedbackError) {
      console.error("Error fetching feedback:", feedbackError);
      return [];
    }
    
    const processedFeedback: FeedbackEntry[] = [];
    
    if (feedbackData && feedbackData.length > 0) {
      for (const fb of feedbackData) {
        // Get supervisor name with a separate query
        const { data: supervisorData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', fb.supervisor_id)
          .single();
        
        processedFeedback.push({
          id: fb.id,
          content: fb.content,
          createdAt: fb.created_at,
          supervisorName: supervisorData?.full_name || 'Unknown'
        });
      }
    }
    
    return processedFeedback;
  } catch (error) {
    console.error("Error in fetchProposalFeedback:", error);
    return [];
  }
};

// Send feedback for a proposal
export const sendProposalFeedback = async (
  proposalId: string,
  supervisorId: string,
  content: string
): Promise<boolean> => {
  if (!content.trim()) {
    toast.error('Feedback tidak boleh kosong');
    return false;
  }

  try {
    const { error } = await supabase
      .from('proposal_feedback')
      .insert({
        proposal_id: proposalId,
        supervisor_id: supervisorId,
        content: content.trim()
      });

    if (error) {
      console.error('Error saving feedback:', error);
      toast.error('Gagal menyimpan feedback');
      return false;
    }

    toast.success('Feedback berhasil disimpan');
    return true;
  } catch (error) {
    console.error('Error saving feedback:', error);
    toast.error('Gagal menyimpan feedback');
    return false;
  }
};
