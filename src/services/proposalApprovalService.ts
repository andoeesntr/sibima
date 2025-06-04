
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const approveProposal = async (proposalId: string) => {
  try {
    console.log('Approving proposal:', proposalId);

    // Use the existing approve_team_proposals function
    const { data, error } = await supabase.rpc('approve_team_proposals', {
      p_proposal_id: proposalId,
      p_new_status: 'approved'
    });

    if (error) {
      console.error('Error approving proposal:', error);
      throw error;
    }

    console.log('Approval result:', data);
    
    if (data?.success) {
      toast.success(`Proposal berhasil disetujui. ${data.updated_count} proposal diperbarui.`);
      return { success: true, data };
    } else {
      throw new Error(data?.message || 'Failed to approve proposal');
    }
  } catch (error) {
    console.error('Error in approveProposal:', error);
    toast.error('Gagal menyetujui proposal');
    throw error;
  }
};

export const rejectProposal = async (proposalId: string, rejectionReason: string) => {
  try {
    console.log('Rejecting proposal:', proposalId, 'with reason:', rejectionReason);

    // Use the existing approve_team_proposals function with rejected status
    const { data, error } = await supabase.rpc('approve_team_proposals', {
      p_proposal_id: proposalId,
      p_new_status: 'rejected',
      p_rejection_reason: rejectionReason
    });

    if (error) {
      console.error('Error rejecting proposal:', error);
      throw error;
    }

    console.log('Rejection result:', data);
    
    if (data?.success) {
      toast.success(`Proposal berhasil ditolak. ${data.updated_count} proposal diperbarui.`);
      return { success: true, data };
    } else {
      throw new Error(data?.message || 'Failed to reject proposal');
    }
  } catch (error) {
    console.error('Error in rejectProposal:', error);
    toast.error('Gagal menolak proposal');
    throw error;
  }
};

export const requestRevision = async (proposalId: string, revisionReason: string) => {
  try {
    console.log('Requesting revision for proposal:', proposalId, 'with reason:', revisionReason);

    // Use the existing approve_team_proposals function with revision status
    const { data, error } = await supabase.rpc('approve_team_proposals', {
      p_proposal_id: proposalId,
      p_new_status: 'revision',
      p_rejection_reason: revisionReason
    });

    if (error) {
      console.error('Error requesting revision:', error);
      throw error;
    }

    console.log('Revision request result:', data);
    
    if (data?.success) {
      toast.success(`Permintaan revisi berhasil dikirim. ${data.updated_count} proposal diperbarui.`);
      return { success: true, data };
    } else {
      throw new Error(data?.message || 'Failed to request revision');
    }
  } catch (error) {
    console.error('Error in requestRevision:', error);
    toast.error('Gagal mengirim permintaan revisi');
    throw error;
  }
};
