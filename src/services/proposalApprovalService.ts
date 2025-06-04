
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApprovalResult {
  success: boolean;
  message: string;
  affectedProposals?: number;
  errors?: string[];
  teamId?: string;
  bulkError?: string;
  failedUpdates?: any[];
}

export class ProposalApprovalService {
  
  // Enhanced approval using direct update approach instead of stored procedure
  static async approveProposal(proposalId: string, rejectionReason?: string): Promise<ApprovalResult> {
    console.log(`🚀 Starting proposal approval for: ${proposalId}`);
    
    try {
      // Step 1: Get proposal details first
      const { data: proposal, error: fetchError } = await supabase
        .from('proposals')
        .select('id, team_id, status, title, student_id')
        .eq('id', proposalId)
        .single();

      if (fetchError || !proposal) {
        console.error(`❌ Error fetching proposal:`, fetchError);
        return {
          success: false,
          message: `Proposal tidak ditemukan: ${fetchError?.message || 'Unknown error'}`,
          errors: [fetchError?.message || 'Proposal not found']
        };
      }

      console.log(`📋 Found proposal:`, proposal);

      // Step 2: Handle individual proposal (no team)
      if (!proposal.team_id) {
        const { error: updateError } = await supabase
          .from('proposals')
          .update({
            status: 'approved',
            rejection_reason: rejectionReason || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', proposalId);

        if (updateError) {
          console.error(`❌ Individual update failed:`, updateError);
          return {
            success: false,
            message: `Gagal mengupdate proposal: ${updateError.message}`,
            errors: [updateError.message]
          };
        }

        console.log(`✅ Individual proposal updated successfully`);
        return {
          success: true,
          message: 'Proposal berhasil disetujui',
          affectedProposals: 1
        };
      }

      // Step 3: Handle team proposals
      console.log(`👥 Processing team proposals for team: ${proposal.team_id}`);
      
      // Get all team proposals that are not already approved
      const { data: teamProposals, error: teamFetchError } = await supabase
        .from('proposals')
        .select('id, student_id, status')
        .eq('team_id', proposal.team_id)
        .neq('status', 'approved');

      if (teamFetchError) {
        console.error(`❌ Error fetching team proposals:`, teamFetchError);
        return {
          success: false,
          message: `Gagal mengambil data tim: ${teamFetchError.message}`,
          errors: [teamFetchError.message]
        };
      }

      if (!teamProposals || teamProposals.length === 0) {
        return {
          success: true,
          message: 'Semua proposal tim sudah disetujui',
          affectedProposals: 0,
          teamId: proposal.team_id
        };
      }

      console.log(`📊 Found ${teamProposals.length} team proposals to update`);

      // Step 4: Update each team proposal individually to avoid constraint issues
      let successCount = 0;
      let failures: any[] = [];

      for (const teamProposal of teamProposals) {
        try {
          const { error: updateError } = await supabase
            .from('proposals')
            .update({
              status: 'approved',
              rejection_reason: rejectionReason || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', teamProposal.id);

          if (updateError) {
            console.error(`❌ Failed to update proposal ${teamProposal.id}:`, updateError);
            failures.push({
              proposal_id: teamProposal.id,
              student_id: teamProposal.student_id,
              error: updateError.message
            });
          } else {
            successCount++;
            console.log(`✅ Updated proposal ${teamProposal.id} successfully`);
          }
        } catch (error: any) {
          console.error(`💥 Exception updating proposal ${teamProposal.id}:`, error);
          failures.push({
            proposal_id: teamProposal.id,
            student_id: teamProposal.student_id,
            error: error.message
          });
        }
      }

      // Step 5: Return results
      const isSuccess = successCount > 0;
      const message = failures.length === 0 
        ? `Berhasil menyetujui ${successCount} proposal tim`
        : `Berhasil menyetujui ${successCount} dari ${teamProposals.length} proposal tim`;

      return {
        success: isSuccess,
        message: message,
        affectedProposals: successCount,
        teamId: proposal.team_id,
        failedUpdates: failures,
        errors: failures.length > 0 ? failures.map(f => `Proposal ${f.proposal_id}: ${f.error}`) : undefined
      };

    } catch (error: any) {
      console.error(`💥 Critical error during approval:`, error);
      return {
        success: false,
        message: `Critical error: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  // Rejection method using direct update
  static async rejectProposal(proposalId: string, rejectionReason: string): Promise<ApprovalResult> {
    console.log(`🚫 Starting proposal rejection for: ${proposalId}`);
    
    if (!rejectionReason?.trim()) {
      return {
        success: false,
        message: 'Alasan penolakan harus diisi'
      };
    }

    try {
      // Get proposal details first
      const { data: proposal, error: fetchError } = await supabase
        .from('proposals')
        .select('id, team_id, status')
        .eq('id', proposalId)
        .single();

      if (fetchError || !proposal) {
        return {
          success: false,
          message: `Proposal tidak ditemukan: ${fetchError?.message || 'Unknown error'}`
        };
      }

      // Handle individual or team proposals using the same logic as approval
      if (!proposal.team_id) {
        const { error: updateError } = await supabase
          .from('proposals')
          .update({
            status: 'rejected',
            rejection_reason: rejectionReason,
            updated_at: new Date().toISOString()
          })
          .eq('id', proposalId);

        if (updateError) {
          return {
            success: false,
            message: `Gagal menolak proposal: ${updateError.message}`
          };
        }

        return {
          success: true,
          message: 'Proposal berhasil ditolak',
          affectedProposals: 1
        };
      }

      // Handle team proposals
      const { data: teamProposals, error: teamFetchError } = await supabase
        .from('proposals')
        .select('id')
        .eq('team_id', proposal.team_id)
        .neq('status', 'rejected');

      if (teamFetchError) {
        return {
          success: false,
          message: `Gagal mengambil data tim: ${teamFetchError.message}`
        };
      }

      // Update team proposals individually
      let successCount = 0;
      for (const teamProposal of teamProposals || []) {
        const { error: updateError } = await supabase
          .from('proposals')
          .update({
            status: 'rejected',
            rejection_reason: rejectionReason,
            updated_at: new Date().toISOString()
          })
          .eq('id', teamProposal.id);

        if (!updateError) {
          successCount++;
        }
      }

      return {
        success: successCount > 0,
        message: `Berhasil menolak ${successCount} proposal tim`,
        affectedProposals: successCount,
        teamId: proposal.team_id
      };

    } catch (error: any) {
      console.error(`💥 Critical error during rejection:`, error);
      return {
        success: false,
        message: `Critical error: ${error.message}`
      };
    }
  }

  // Revision method using direct update
  static async requestRevision(proposalId: string, revisionFeedback: string): Promise<ApprovalResult> {
    console.log(`📝 Starting revision request for: ${proposalId}`);
    
    if (!revisionFeedback?.trim()) {
      return {
        success: false,
        message: 'Catatan revisi harus diisi'
      };
    }

    try {
      // Get proposal details first
      const { data: proposal, error: fetchError } = await supabase
        .from('proposals')
        .select('id, team_id, status')
        .eq('id', proposalId)
        .single();

      if (fetchError || !proposal) {
        return {
          success: false,
          message: `Proposal tidak ditemukan: ${fetchError?.message || 'Unknown error'}`
        };
      }

      // Handle individual or team proposals
      if (!proposal.team_id) {
        const { error: updateError } = await supabase
          .from('proposals')
          .update({
            status: 'revision',
            rejection_reason: revisionFeedback,
            updated_at: new Date().toISOString()
          })
          .eq('id', proposalId);

        if (updateError) {
          return {
            success: false,
            message: `Gagal meminta revisi: ${updateError.message}`
          };
        }

        return {
          success: true,
          message: 'Permintaan revisi berhasil dikirim',
          affectedProposals: 1
        };
      }

      // Handle team proposals
      const { data: teamProposals, error: teamFetchError } = await supabase
        .from('proposals')
        .select('id')
        .eq('team_id', proposal.team_id)
        .neq('status', 'revision');

      if (teamFetchError) {
        return {
          success: false,
          message: `Gagal mengambil data tim: ${teamFetchError.message}`
        };
      }

      // Update team proposals individually
      let successCount = 0;
      for (const teamProposal of teamProposals || []) {
        const { error: updateError } = await supabase
          .from('proposals')
          .update({
            status: 'revision',
            rejection_reason: revisionFeedback,
            updated_at: new Date().toISOString()
          })
          .eq('id', teamProposal.id);

        if (!updateError) {
          successCount++;
        }
      }

      return {
        success: successCount > 0,
        message: `Berhasil meminta revisi untuk ${successCount} proposal tim`,
        affectedProposals: successCount,
        teamId: proposal.team_id
      };

    } catch (error: any) {
      console.error(`💥 Critical error during revision request:`, error);
      return {
        success: false,
        message: `Critical error: ${error.message}`
      };
    }
  }

  // Helper method untuk debugging
  static async getProposalTeamInfo(proposalId: string): Promise<{
    proposal?: any;
    teamMembers?: any[];
    teamProposals?: any[];
  }> {
    try {
      // Get proposal info
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select('id, student_id, team_id, status, title')
        .eq('id', proposalId)
        .single();

      if (proposalError || !proposal) {
        console.error('Error fetching proposal:', proposalError);
        return {};
      }

      let teamMembers: any[] = [];
      let teamProposals: any[] = [];

      if (proposal.team_id) {
        // Get team members
        const { data: members } = await supabase
          .from('team_members')
          .select('user_id, profiles:user_id(full_name)')
          .eq('team_id', proposal.team_id);

        // Get all team proposals
        const { data: proposals } = await supabase
          .from('proposals')
          .select('id, student_id, status, title')
          .eq('team_id', proposal.team_id);

        teamMembers = members || [];
        teamProposals = proposals || [];
      }

      return {
        proposal,
        teamMembers,
        teamProposals
      };

    } catch (error) {
      console.error('Error in getProposalTeamInfo:', error);
      return {};
    }
  }
}
