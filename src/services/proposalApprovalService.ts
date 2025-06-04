
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

interface StoredProcedureResult {
  success: boolean;
  message: string;
  updated_count: number;
  failed_updates: any[];
  team_id?: string;
  bulk_error?: string;
}

export class ProposalApprovalService {
  
  // Enhanced approval using the new stored procedure
  static async approveProposal(proposalId: string, rejectionReason?: string): Promise<ApprovalResult> {
    console.log(`🚀 Starting proposal approval using stored procedure for: ${proposalId}`);
    
    try {
      // Call the stored procedure for atomic team proposal approval
      const { data: result, error } = await supabase.rpc('approve_team_proposals', {
        p_proposal_id: proposalId,
        p_new_status: 'approved',
        p_rejection_reason: rejectionReason || null
      });

      if (error) {
        console.error(`❌ Stored procedure error:`, error);
        return {
          success: false,
          message: `Database error: ${error.message}`,
          errors: [error.message]
        };
      }

      if (!result) {
        return {
          success: false,
          message: 'No result returned from stored procedure',
          errors: ['Empty result from database']
        };
      }

      const procedureResult = result as unknown as StoredProcedureResult;
      console.log(`📊 Stored procedure result:`, procedureResult);

      // Transform the result to match our interface
      const transformedResult: ApprovalResult = {
        success: procedureResult.success,
        message: procedureResult.message,
        affectedProposals: procedureResult.updated_count,
        teamId: procedureResult.team_id,
        bulkError: procedureResult.bulk_error,
        failedUpdates: procedureResult.failed_updates || []
      };

      if (procedureResult.failed_updates && procedureResult.failed_updates.length > 0) {
        transformedResult.errors = procedureResult.failed_updates.map(
          (failure: any) => `Proposal ${failure.proposal_id}: ${failure.error}`
        );
      }

      // Log detailed results
      if (transformedResult.success) {
        console.log(`✅ Approval completed successfully`);
        console.log(`📈 Updated ${transformedResult.affectedProposals} proposals`);
        if (transformedResult.teamId) {
          console.log(`👥 Team ID: ${transformedResult.teamId}`);
        }
      } else {
        console.error(`❌ Approval failed: ${transformedResult.message}`);
        if (transformedResult.errors) {
          transformedResult.errors.forEach(error => {
            console.error(`📋 Error detail: ${error}`);
          });
        }
      }

      return transformedResult;

    } catch (error: any) {
      console.error(`💥 Critical error during stored procedure call:`, error);
      return {
        success: false,
        message: `Critical error: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  // Rejection method using stored procedure
  static async rejectProposal(proposalId: string, rejectionReason: string): Promise<ApprovalResult> {
    console.log(`🚫 Starting proposal rejection using stored procedure for: ${proposalId}`);
    
    if (!rejectionReason?.trim()) {
      return {
        success: false,
        message: 'Rejection reason is required'
      };
    }

    try {
      const { data: result, error } = await supabase.rpc('approve_team_proposals', {
        p_proposal_id: proposalId,
        p_new_status: 'rejected',
        p_rejection_reason: rejectionReason
      });

      if (error) {
        console.error(`❌ Stored procedure error:`, error);
        return {
          success: false,
          message: `Database error: ${error.message}`,
          errors: [error.message]
        };
      }

      if (!result) {
        return {
          success: false,
          message: 'No result returned from stored procedure'
        };
      }

      const procedureResult = result as unknown as StoredProcedureResult;
      console.log(`📊 Rejection result:`, procedureResult);

      return {
        success: procedureResult.success,
        message: procedureResult.message,
        affectedProposals: procedureResult.updated_count,
        teamId: procedureResult.team_id,
        failedUpdates: procedureResult.failed_updates || []
      };

    } catch (error: any) {
      console.error(`💥 Critical error during rejection:`, error);
      return {
        success: false,
        message: `Critical error: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  // Revision method using stored procedure
  static async requestRevision(proposalId: string, revisionFeedback: string): Promise<ApprovalResult> {
    console.log(`📝 Starting revision request using stored procedure for: ${proposalId}`);
    
    if (!revisionFeedback?.trim()) {
      return {
        success: false,
        message: 'Revision feedback is required'
      };
    }

    try {
      const { data: result, error } = await supabase.rpc('approve_team_proposals', {
        p_proposal_id: proposalId,
        p_new_status: 'revision',
        p_rejection_reason: revisionFeedback
      });

      if (error) {
        console.error(`❌ Stored procedure error:`, error);
        return {
          success: false,
          message: `Database error: ${error.message}`,
          errors: [error.message]
        };
      }

      if (!result) {
        return {
          success: false,
          message: 'No result returned from stored procedure'
        };
      }

      const procedureResult = result as unknown as StoredProcedureResult;
      console.log(`📊 Revision result:`, procedureResult);

      return {
        success: procedureResult.success,
        message: procedureResult.message,
        affectedProposals: procedureResult.updated_count,
        teamId: procedureResult.team_id,
        failedUpdates: procedureResult.failed_updates || []
      };

    } catch (error: any) {
      console.error(`💥 Critical error during revision request:`, error);
      return {
        success: false,
        message: `Critical error: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  // Test method untuk memvalidasi stored procedure
  static async testStoredProcedure(proposalId: string): Promise<{
    procedureExists: boolean;
    canExecute: boolean;
    validationResult?: any;
  }> {
    try {
      console.log(`🧪 Testing stored procedure accessibility for proposal: ${proposalId}`);
      
      // Test dengan status yang sama untuk memastikan tidak ada update
      const { data: result, error } = await supabase.rpc('approve_team_proposals', {
        p_proposal_id: proposalId,
        p_new_status: 'submitted', // Status yang kemungkinan sudah sama
        p_rejection_reason: null
      });

      if (error) {
        console.error(`❌ Test failed:`, error);
        return {
          procedureExists: false,
          canExecute: false,
          validationResult: error
        };
      }

      console.log(`✅ Stored procedure test successful:`, result);
      return {
        procedureExists: true,
        canExecute: true,
        validationResult: result
      };

    } catch (error: any) {
      console.error(`💥 Test procedure error:`, error);
      return {
        procedureExists: false,
        canExecute: false,
        validationResult: error
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
