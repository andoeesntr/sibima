import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApprovalResult {
  success: boolean;
  message: string;
  affectedProposals?: number;
  errors?: string[];
}

interface ProposalData {
  id: string;
  team_id: string | null;
  student_id: string;
  title: string;
  description: string;
  company_name: string;
  supervisor_id: string;
  status: string;
}

export class ProposalApprovalService {
  
  // Enhanced approval with comprehensive error handling
  static async approveProposal(proposalId: string, rejectionReason?: string): Promise<ApprovalResult> {
    console.log(`🚀 Starting proposal approval for: ${proposalId}`);
    
    try {
      // Step 1: Validate and fetch proposal data
      const proposalData = await this.validateAndFetchProposal(proposalId);
      if (!proposalData.success) {
        return proposalData;
      }

      const proposal = proposalData.data!;
      console.log(`📋 Proposal data:`, proposal);

      // Step 2: Handle approval based on team status
      if (proposal.team_id) {
        console.log(`👥 Processing team approval for team: ${proposal.team_id}`);
        return await this.approveTeamProposal(proposal, rejectionReason);
      } else {
        console.log(`👤 Processing individual approval`);
        return await this.approveIndividualProposal(proposal.id, rejectionReason);
      }

    } catch (error: any) {
      console.error(`❌ Critical error during approval:`, error);
      return {
        success: false,
        message: `Critical error: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  // Validate proposal exists and can be approved
  private static async validateAndFetchProposal(proposalId: string): Promise<{
    success: boolean;
    message: string;
    data?: ProposalData;
  }> {
    try {
      const { data: proposal, error } = await supabase
        .from('proposals')
        .select('id, team_id, student_id, title, description, company_name, supervisor_id, status')
        .eq('id', proposalId)
        .single();

      if (error) {
        console.error(`❌ Error fetching proposal:`, error);
        return {
          success: false,
          message: `Failed to fetch proposal: ${error.message}`
        };
      }

      if (!proposal) {
        return {
          success: false,
          message: 'Proposal not found'
        };
      }

      if (proposal.status === 'approved') {
        return {
          success: false,
          message: 'Proposal is already approved'
        };
      }

      return {
        success: true,
        message: 'Proposal validated successfully',
        data: proposal
      };

    } catch (error: any) {
      console.error(`❌ Validation error:`, error);
      return {
        success: false,
        message: `Validation failed: ${error.message}`
      };
    }
  }

  // Handle individual proposal approval
  private static async approveIndividualProposal(proposalId: string, rejectionReason?: string): Promise<ApprovalResult> {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({
          status: 'approved',
          rejection_reason: rejectionReason || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId);

      if (error) {
        console.error(`❌ Error updating individual proposal:`, error);
        return {
          success: false,
          message: `Failed to approve proposal: ${error.message}`,
          errors: [error.message]
        };
      }

      console.log(`✅ Individual proposal approved successfully`);
      return {
        success: true,
        message: 'Proposal approved successfully',
        affectedProposals: 1
      };

    } catch (error: any) {
      console.error(`❌ Individual approval error:`, error);
      return {
        success: false,
        message: `Individual approval failed: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  // Handle team proposal approval with transaction safety
  private static async approveTeamProposal(proposal: ProposalData, rejectionReason?: string): Promise<ApprovalResult> {
    try {
      // Step 1: Ensure all team members have proposals
      const ensureResult = await this.ensureAllTeamMembersHaveProposals(proposal);
      if (!ensureResult.success) {
        return ensureResult;
      }

      // Step 2: Update all team proposals
      const updateResult = await this.updateAllTeamProposals(proposal.team_id!, rejectionReason);
      if (!updateResult.success) {
        return updateResult;
      }

      console.log(`✅ Team proposal approved successfully for ${updateResult.affectedProposals} members`);
      return {
        success: true,
        message: `Proposal approved for all ${updateResult.affectedProposals} team members`,
        affectedProposals: updateResult.affectedProposals
      };

    } catch (error: any) {
      console.error(`❌ Team approval error:`, error);
      return {
        success: false,
        message: `Team approval failed: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  // Ensure all team members have proposal records
  private static async ensureAllTeamMembersHaveProposals(baseProposal: ProposalData): Promise<ApprovalResult> {
    try {
      console.log(`🔍 Checking team members for team: ${baseProposal.team_id}`);
      
      // Get all team members
      const { data: teamMembers, error: teamMembersError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', baseProposal.team_id);

      if (teamMembersError) {
        console.error(`❌ Error fetching team members:`, teamMembersError);
        return {
          success: false,
          message: `Failed to fetch team members: ${teamMembersError.message}`,
          errors: [teamMembersError.message]
        };
      }

      if (!teamMembers || teamMembers.length === 0) {
        return {
          success: false,
          message: 'No team members found'
        };
      }

      console.log(`👥 Found ${teamMembers.length} team members`);

      // Check existing proposals
      const memberIds = teamMembers.map(m => m.user_id);
      const { data: existingProposals, error: existingError } = await supabase
        .from('proposals')
        .select('student_id')
        .in('student_id', memberIds)
        .eq('team_id', baseProposal.team_id);

      if (existingError) {
        console.error(`❌ Error checking existing proposals:`, existingError);
        return {
          success: false,
          message: `Failed to check existing proposals: ${existingError.message}`,
          errors: [existingError.message]
        };
      }

      const existingMemberIds = (existingProposals || []).map(p => p.student_id);
      const missingMemberIds = memberIds.filter(id => !existingMemberIds.includes(id));

      console.log(`📊 ${existingMemberIds.length} members have proposals, ${missingMemberIds.length} missing`);

      // Create missing proposals one by one
      if (missingMemberIds.length > 0) {
        const createResults = await Promise.allSettled(
          missingMemberIds.map(async (studentId) => {
            const { error } = await supabase
              .from('proposals')
              .upsert({
                student_id: studentId,
                team_id: baseProposal.team_id,
                title: baseProposal.title,
                description: baseProposal.description,
                company_name: baseProposal.company_name,
                supervisor_id: baseProposal.supervisor_id,
                status: 'submitted'
              }, {
                onConflict: 'student_id,team_id'
              });

            if (error) throw error;
            return true;
          })
        );

        const failures = createResults.filter(result => result.status === 'rejected');
        if (failures.length > 0) {
          console.error(`❌ Failed to create ${failures.length} proposals`);
          return {
            success: false,
            message: `Failed to create proposals for ${failures.length} team members`,
            errors: failures.map(f => (f as PromiseRejectedResult).reason.message)
          };
        }

        console.log(`✅ Successfully created ${missingMemberIds.length} missing proposals`);
      }

      return {
        success: true,
        message: 'All team members have proposals'
      };

    } catch (error: any) {
      console.error(`❌ Error ensuring team proposals:`, error);
      return {
        success: false,
        message: `Failed to ensure team proposals: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  // Update all team proposals in a single operation
  private static async updateAllTeamProposals(teamId: string, rejectionReason?: string): Promise<ApprovalResult> {
    try {
      // 1. Fetch all proposals for the team
      const { data: proposals, error: fetchError } = await supabase
        .from('proposals')
        .select('id, student_id, status')
        .eq('team_id', teamId);

      if (fetchError || !proposals || proposals.length === 0) {
        const errorMsg = fetchError?.message || 'No proposals found for team';
        console.error(`❌ Fetch failed:`, errorMsg);
        return {
          success: false,
          message: `Failed to fetch proposals: ${errorMsg}`,
          errors: [errorMsg]
        };
      }

      console.log(`📋 Found ${proposals.length} proposals to update`);

      // 2. Update each proposal and collect results
      const results: Array<{
        proposalId: string;
        studentId: string;
        success: boolean;
        error?: string;
      }> = [];

      for (const proposal of proposals) {
        try {
          const { error } = await supabase
            .from('proposals')
            .update({
              status: 'approved',
              rejection_reason: rejectionReason || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', proposal.id);

          if (error) {
            console.error(`❌ Failed to update proposal ${proposal.id}:`, error.message);
            results.push({
              proposalId: proposal.id,
              studentId: proposal.student_id,
              success: false,
              error: error.message
            });
          } else {
            results.push({
              proposalId: proposal.id,
              studentId: proposal.student_id,
              success: true
            });
          }
        } catch (error: any) {
          console.error(`❌ Unexpected error updating proposal ${proposal.id}:`, error);
          results.push({
            proposalId: proposal.id,
            studentId: proposal.student_id,
            success: false,
            error: error.message
          });
        }
      }

      // 3. Analyze results
      const failedResults = results.filter(r => !r.success);
      
      if (failedResults.length > 0) {
        const errorMessages: string[] = failedResults.map(r => 
          `Proposal ${r.proposalId} (Student: ${r.studentId}): ${r.error || 'Unknown error'}`
        );
        
        console.error(`❌ Partial update failed for ${failedResults.length} proposals`);
        return {
          success: false,
          message: `Failed to update ${failedResults.length} of ${proposals.length} proposals`,
          errors: errorMessages,
          affectedProposals: proposals.length - failedResults.length
        };
      }

      console.log(`✅ Successfully updated all ${proposals.length} proposals`);
      return {
        success: true,
        message: `Updated all ${proposals.length} proposals`,
        affectedProposals: proposals.length
      };
    } catch (error: any) {
      console.error(`❌ Unexpected error in updateAllTeamProposals:`, error);
      return {
        success: false,
        message: `Unexpected error: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  // Rejection method with same robustness
  static async rejectProposal(proposalId: string, rejectionReason: string): Promise<ApprovalResult> {
    console.log(`🚫 Starting proposal rejection for: ${proposalId}`);
    
    if (!rejectionReason?.trim()) {
      return {
        success: false,
        message: 'Rejection reason is required'
      };
    }

    try {
      const proposalData = await this.validateAndFetchProposal(proposalId);
      if (!proposalData.success) {
        return proposalData;
      }

      const proposal = proposalData.data!;

      if (proposal.team_id) {
        console.log(`👥 Processing team rejection for team: ${proposal.team_id}`);
        return await this.rejectTeamProposal(proposal.team_id, rejectionReason);
      } else {
        console.log(`👤 Processing individual rejection`);
        return await this.rejectIndividualProposal(proposal.id, rejectionReason);
      }

    } catch (error: any) {
      console.error(`❌ Critical error during rejection:`, error);
      return {
        success: false,
        message: `Critical error: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  private static async rejectIndividualProposal(proposalId: string, rejectionReason: string): Promise<ApprovalResult> {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId);

      if (error) {
        console.error(`❌ Error rejecting individual proposal:`, error);
        return {
          success: false,
          message: `Failed to reject proposal: ${error.message}`,
          errors: [error.message]
        };
      }

      return {
        success: true,
        message: 'Proposal rejected successfully',
        affectedProposals: 1
      };

    } catch (error: any) {
      return {
        success: false,
        message: `Individual rejection failed: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  private static async rejectTeamProposal(teamId: string, rejectionReason: string): Promise<ApprovalResult> {
    try {
      const { data: updatedProposals, error: updateError } = await supabase
        .from('proposals')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString()
        })
        .eq('team_id', teamId)
        .select('id');

      if (updateError) {
        console.error(`❌ Error rejecting team proposals:`, updateError);
        return {
          success: false,
          message: `Failed to reject team proposals: ${updateError.message}`,
          errors: [updateError.message]
        };
      }

      return {
        success: true,
        message: `Rejected ${updatedProposals?.length || 0} team proposals`,
        affectedProposals: updatedProposals?.length || 0
      };

    } catch (error: any) {
      return {
        success: false,
        message: `Team rejection failed: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  // Revision method
  static async requestRevision(proposalId: string, revisionFeedback: string): Promise<ApprovalResult> {
    console.log(`📝 Starting revision request for: ${proposalId}`);
    
    if (!revisionFeedback?.trim()) {
      return {
        success: false,
        message: 'Revision feedback is required'
      };
    }

    try {
      const proposalData = await this.validateAndFetchProposal(proposalId);
      if (!proposalData.success) {
        return proposalData;
      }

      const proposal = proposalData.data!;

      if (proposal.team_id) {
        return await this.requestTeamRevision(proposal.team_id, revisionFeedback);
      } else {
        return await this.requestIndividualRevision(proposal.id, revisionFeedback);
      }

    } catch (error: any) {
      console.error(`❌ Critical error during revision request:`, error);
      return {
        success: false,
        message: `Critical error: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  private static async requestIndividualRevision(proposalId: string, revisionFeedback: string): Promise<ApprovalResult> {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({
          status: 'revision',
          rejection_reason: revisionFeedback,
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId);

      if (error) {
        return {
          success: false,
          message: `Failed to request revision: ${error.message}`,
          errors: [error.message]
        };
      }

      return {
        success: true,
        message: 'Revision requested successfully',
        affectedProposals: 1
      };

    } catch (error: any) {
      return {
        success: false,
        message: `Individual revision failed: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  private static async requestTeamRevision(teamId: string, revisionFeedback: string): Promise<ApprovalResult> {
    try {
      const { data: updatedProposals, error: updateError } = await supabase
        .from('proposals')
        .update({
          status: 'revision',
          rejection_reason: revisionFeedback,
          updated_at: new Date().toISOString()
        })
        .eq('team_id', teamId)
        .select('id');

      if (updateError) {
        return {
          success: false,
          message: `Failed to request team revision: ${updateError.message}`,
          errors: [updateError.message]
        };
      }

      return {
        success: true,
        message: `Revision requested for ${updatedProposals?.length || 0} team proposals`,
        affectedProposals: updatedProposals?.length || 0
      };

    } catch (error: any) {
      return {
        success: false,
        message: `Team revision failed: ${error.message}`,
        errors: [error.message]
      };
    }
  }
}
