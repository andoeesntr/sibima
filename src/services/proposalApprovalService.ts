
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ApprovalResult {
  success: boolean;
  message: string;
  affectedProposals?: number;
  teamId?: string;
  failedUpdates?: string[];
  errors?: string[];
  bulkError?: string;
}

export class ProposalApprovalService {
  static async approveProposal(proposalId: string): Promise<ApprovalResult> {
    try {
      console.log(`🚀 Starting approval process for proposal ${proposalId}`);
      
      // Get proposal details first
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select('id, team_id, student_id, title')
        .eq('id', proposalId)
        .single();

      if (proposalError) {
        console.error('Error fetching proposal:', proposalError);
        return {
          success: false,
          message: 'Gagal mengambil data proposal',
          errors: [proposalError.message]
        };
      }

      if (!proposal) {
        return {
          success: false,
          message: 'Proposal tidak ditemukan'
        };
      }

      let affectedProposals = 1;
      const failedUpdates: string[] = [];

      // If it's a team proposal, update all team members' proposals
      if (proposal.team_id) {
        console.log(`👥 Processing team proposal for team: ${proposal.team_id}`);
        
        // Get all team members
        const { data: teamMembers, error: teamMembersError } = await supabase
          .from('team_members')
          .select('user_id')
          .eq('team_id', proposal.team_id);

        if (teamMembersError) {
          console.error('Error fetching team members:', teamMembersError);
          return {
            success: false,
            message: 'Gagal mengambil data anggota tim',
            errors: [teamMembersError.message]
          };
        }

        if (teamMembers && teamMembers.length > 0) {
          // Get all proposals for team members
          const memberIds = teamMembers.map(member => member.user_id);
          
          const { data: teamProposals, error: teamProposalsError } = await supabase
            .from('proposals')
            .select('id, student_id')
            .in('student_id', memberIds)
            .eq('team_id', proposal.team_id);

          if (teamProposalsError) {
            console.error('Error fetching team proposals:', teamProposalsError);
            return {
              success: false,
              message: 'Gagal mengambil data proposal tim',
              errors: [teamProposalsError.message]
            };
          }

          if (teamProposals && teamProposals.length > 0) {
            affectedProposals = teamProposals.length;
            
            // Update each proposal individually to avoid conflicts
            for (const teamProposal of teamProposals) {
              try {
                const { error: updateError } = await supabase
                  .from('proposals')
                  .update({ 
                    status: 'approved',
                    rejection_reason: null,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', teamProposal.id);

                if (updateError) {
                  console.error(`Failed to update proposal ${teamProposal.id}:`, updateError);
                  failedUpdates.push(teamProposal.id);
                }
              } catch (error) {
                console.error(`Error updating proposal ${teamProposal.id}:`, error);
                failedUpdates.push(teamProposal.id);
              }
            }
          }
        }
      } else {
        // Individual proposal - update just this one
        const { error: updateError } = await supabase
          .from('proposals')
          .update({ 
            status: 'approved',
            rejection_reason: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', proposalId);

        if (updateError) {
          console.error('Error updating individual proposal:', updateError);
          return {
            success: false,
            message: 'Gagal menyetujui proposal',
            errors: [updateError.message]
          };
        }
      }

      const successfulUpdates = affectedProposals - failedUpdates.length;
      
      if (successfulUpdates === 0) {
        return {
          success: false,
          message: 'Gagal menyetujui semua proposal',
          affectedProposals,
          failedUpdates
        };
      }

      let message = 'Proposal berhasil disetujui';
      if (proposal.team_id && affectedProposals > 1) {
        message = `${successfulUpdates} proposal tim berhasil disetujui`;
      }

      return {
        success: true,
        message,
        affectedProposals: successfulUpdates,
        teamId: proposal.team_id,
        failedUpdates: failedUpdates.length > 0 ? failedUpdates : undefined
      };

    } catch (error: any) {
      console.error('Unexpected error during approval:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan tidak terduga saat menyetujui proposal',
        errors: [error.message]
      };
    }
  }

  static async rejectProposal(proposalId: string, rejectionReason: string): Promise<ApprovalResult> {
    try {
      console.log(`🚫 Starting rejection process for proposal ${proposalId}`);
      
      // Get proposal details first
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select('id, team_id, student_id, title')
        .eq('id', proposalId)
        .single();

      if (proposalError) {
        console.error('Error fetching proposal:', proposalError);
        return {
          success: false,
          message: 'Gagal mengambil data proposal',
          errors: [proposalError.message]
        };
      }

      if (!proposal) {
        return {
          success: false,
          message: 'Proposal tidak ditemukan'
        };
      }

      let affectedProposals = 1;
      const failedUpdates: string[] = [];

      // If it's a team proposal, update all team members' proposals
      if (proposal.team_id) {
        console.log(`👥 Processing team proposal rejection for team: ${proposal.team_id}`);
        
        // Get all team members
        const { data: teamMembers, error: teamMembersError } = await supabase
          .from('team_members')
          .select('user_id')
          .eq('team_id', proposal.team_id);

        if (teamMembersError) {
          console.error('Error fetching team members:', teamMembersError);
          return {
            success: false,
            message: 'Gagal mengambil data anggota tim',
            errors: [teamMembersError.message]
          };
        }

        if (teamMembers && teamMembers.length > 0) {
          // Get all proposals for team members
          const memberIds = teamMembers.map(member => member.user_id);
          
          const { data: teamProposals, error: teamProposalsError } = await supabase
            .from('proposals')
            .select('id, student_id')
            .in('student_id', memberIds)
            .eq('team_id', proposal.team_id);

          if (teamProposalsError) {
            console.error('Error fetching team proposals:', teamProposalsError);
            return {
              success: false,
              message: 'Gagal mengambil data proposal tim',
              errors: [teamProposalsError.message]
            };
          }

          if (teamProposals && teamProposals.length > 0) {
            affectedProposals = teamProposals.length;
            
            // Update each proposal individually
            for (const teamProposal of teamProposals) {
              try {
                const { error: updateError } = await supabase
                  .from('proposals')
                  .update({ 
                    status: 'rejected',
                    rejection_reason: rejectionReason,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', teamProposal.id);

                if (updateError) {
                  console.error(`Failed to update proposal ${teamProposal.id}:`, updateError);
                  failedUpdates.push(teamProposal.id);
                }
              } catch (error) {
                console.error(`Error updating proposal ${teamProposal.id}:`, error);
                failedUpdates.push(teamProposal.id);
              }
            }
          }
        }
      } else {
        // Individual proposal - update just this one
        const { error: updateError } = await supabase
          .from('proposals')
          .update({ 
            status: 'rejected',
            rejection_reason: rejectionReason,
            updated_at: new Date().toISOString()
          })
          .eq('id', proposalId);

        if (updateError) {
          console.error('Error updating individual proposal:', updateError);
          return {
            success: false,
            message: 'Gagal menolak proposal',
            errors: [updateError.message]
          };
        }
      }

      const successfulUpdates = affectedProposals - failedUpdates.length;
      
      if (successfulUpdates === 0) {
        return {
          success: false,
          message: 'Gagal menolak semua proposal',
          affectedProposals,
          failedUpdates
        };
      }

      let message = 'Proposal berhasil ditolak';
      if (proposal.team_id && affectedProposals > 1) {
        message = `${successfulUpdates} proposal tim berhasil ditolak`;
      }

      return {
        success: true,
        message,
        affectedProposals: successfulUpdates,
        teamId: proposal.team_id,
        failedUpdates: failedUpdates.length > 0 ? failedUpdates : undefined
      };

    } catch (error: any) {
      console.error('Unexpected error during rejection:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan tidak terduga saat menolak proposal',
        errors: [error.message]
      };
    }
  }

  static async requestRevision(proposalId: string, revisionFeedback: string): Promise<ApprovalResult> {
    try {
      console.log(`📝 Starting revision request process for proposal ${proposalId}`);
      
      // Get proposal details first
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select('id, team_id, student_id, title')
        .eq('id', proposalId)
        .single();

      if (proposalError) {
        console.error('Error fetching proposal:', proposalError);
        return {
          success: false,
          message: 'Gagal mengambil data proposal',
          errors: [proposalError.message]
        };
      }

      if (!proposal) {
        return {
          success: false,
          message: 'Proposal tidak ditemukan'
        };
      }

      let affectedProposals = 1;
      const failedUpdates: string[] = [];

      // If it's a team proposal, update all team members' proposals
      if (proposal.team_id) {
        console.log(`👥 Processing team proposal revision for team: ${proposal.team_id}`);
        
        // Get all team members
        const { data: teamMembers, error: teamMembersError } = await supabase
          .from('team_members')
          .select('user_id')
          .eq('team_id', proposal.team_id);

        if (teamMembersError) {
          console.error('Error fetching team members:', teamMembersError);
          return {
            success: false,
            message: 'Gagal mengambil data anggota tim',
            errors: [teamMembersError.message]
          };
        }

        if (teamMembers && teamMembers.length > 0) {
          // Get all proposals for team members
          const memberIds = teamMembers.map(member => member.user_id);
          
          const { data: teamProposals, error: teamProposalsError } = await supabase
            .from('proposals')
            .select('id, student_id')
            .in('student_id', memberIds)
            .eq('team_id', proposal.team_id);

          if (teamProposalsError) {
            console.error('Error fetching team proposals:', teamProposalsError);
            return {
              success: false,
              message: 'Gagal mengambil data proposal tim',
              errors: [teamProposalsError.message]
            };
          }

          if (teamProposals && teamProposals.length > 0) {
            affectedProposals = teamProposals.length;
            
            // Update each proposal individually
            for (const teamProposal of teamProposals) {
              try {
                const { error: updateError } = await supabase
                  .from('proposals')
                  .update({ 
                    status: 'revision',
                    rejection_reason: revisionFeedback,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', teamProposal.id);

                if (updateError) {
                  console.error(`Failed to update proposal ${teamProposal.id}:`, updateError);
                  failedUpdates.push(teamProposal.id);
                }
              } catch (error) {
                console.error(`Error updating proposal ${teamProposal.id}:`, error);
                failedUpdates.push(teamProposal.id);
              }
            }
          }
        }
      } else {
        // Individual proposal - update just this one
        const { error: updateError } = await supabase
          .from('proposals')
          .update({ 
            status: 'revision',
            rejection_reason: revisionFeedback,
            updated_at: new Date().toISOString()
          })
          .eq('id', proposalId);

        if (updateError) {
          console.error('Error updating individual proposal:', updateError);
          return {
            success: false,
            message: 'Gagal meminta revisi proposal',
            errors: [updateError.message]
          };
        }
      }

      const successfulUpdates = affectedProposals - failedUpdates.length;
      
      if (successfulUpdates === 0) {
        return {
          success: false,
          message: 'Gagal meminta revisi semua proposal',
          affectedProposals,
          failedUpdates
        };
      }

      let message = 'Permintaan revisi berhasil dikirim';
      if (proposal.team_id && affectedProposals > 1) {
        message = `Permintaan revisi berhasil dikirim ke ${successfulUpdates} proposal tim`;
      }

      return {
        success: true,
        message,
        affectedProposals: successfulUpdates,
        teamId: proposal.team_id,
        failedUpdates: failedUpdates.length > 0 ? failedUpdates : undefined
      };

    } catch (error: any) {
      console.error('Unexpected error during revision request:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan tidak terduga saat meminta revisi proposal',
        errors: [error.message]
      };
    }
  }

  static async getProposalTeamInfo(proposalId: string) {
    try {
      const { data: proposal, error } = await supabase
        .from('proposals')
        .select(`
          id, title, team_id, student_id,
          team:teams (id, name),
          student:profiles!student_id (full_name)
        `)
        .eq('id', proposalId)
        .single();

      if (error) {
        console.error('Error fetching proposal team info:', error);
        return null;
      }

      if (proposal?.team_id) {
        const { data: teamMembers } = await supabase
          .from('team_members')
          .select('user_id')
          .eq('team_id', proposal.team_id);

        const { data: teamProposals } = await supabase
          .from('proposals')
          .select('id, student_id')
          .eq('team_id', proposal.team_id);

        return {
          proposal,
          teamMembers: teamMembers || [],
          teamProposals: teamProposals || []
        };
      }

      return { proposal, teamMembers: [], teamProposals: [] };
    } catch (error) {
      console.error('Error in getProposalTeamInfo:', error);
      return null;
    }
  }
}
