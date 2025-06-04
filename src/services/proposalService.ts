import { supabase } from '@/integrations/supabase/client';
import { Proposal } from '@/types/proposals';
import { toast } from 'sonner';

export async function fetchProposalsList() {
  try {
    console.log('🔍 Fetching proposals list...');
    
    // Fetch proposals with proper error handling and timeout
    const { data, error } = await supabase
      .from('proposals')
      .select(`
        id, 
        title,
        description,
        status, 
        created_at,
        company_name,
        supervisor_id,
        student_id,
        team_id,
        rejection_reason,
        student:profiles!student_id (full_name, nim),
        team:teams (id, name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("❌ Error fetching proposals:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Provide more specific error messages
      if (error.message.includes('permission denied')) {
        toast.error("Akses ditolak. Pastikan Anda memiliki izin untuk melihat proposal.");
      } else if (error.message.includes('connection')) {
        toast.error("Masalah koneksi database. Silakan coba lagi.");
      } else {
        toast.error(`Gagal memuat proposal: ${error.message}`);
      }
      
      throw error;
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} proposals`);
    return data || [];
  } catch (error: any) {
    console.error("💥 Unexpected error fetching proposals:", error);
    
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
}

export async function fetchProposalDocuments(proposalId: string) {
  try {
    console.log(`🔍 Fetching documents for proposal: ${proposalId}`);
    
    // First, we need to check if this proposal is part of a team
    const { data: proposalData, error: proposalError } = await supabase
      .from('proposals')
      .select('team_id')
      .eq('id', proposalId)
      .single();
    
    if (proposalError) {
      console.error(`Error fetching proposal ${proposalId} team info:`, proposalError);
      return [];
    }

    // If the proposal is part of a team, we should fetch all documents for all proposals in the team
    if (proposalData?.team_id) {
      // Get all proposals for this team
      const { data: teamProposals, error: teamProposalsError } = await supabase
        .from('proposals')
        .select('id')
        .eq('team_id', proposalData.team_id);
      
      if (teamProposalsError) {
        console.error(`Error fetching team proposals for team ${proposalData.team_id}:`, teamProposalsError);
        return [];
      }

      if (teamProposals && teamProposals.length > 0) {
        // Get all proposal IDs in the team
        const teamProposalIds = teamProposals.map(p => p.id);
        
        // Fetch documents for all proposals in the team
        const { data, error } = await supabase
          .from('proposal_documents')
          .select('id, file_name, file_url, file_type, uploaded_at')
          .in('proposal_id', teamProposalIds)
          .order('uploaded_at', { ascending: false });
        
        if (error) {
          console.error(`Error fetching documents for team proposals:`, error);
          return [];
        }

        console.log(`✅ Found ${data?.length || 0} documents for team`);
        return data || [];
      }
    }

    // If no team or fallback, just fetch documents for this proposal
    const { data, error } = await supabase
      .from('proposal_documents')
      .select('id, file_name, file_url, file_type, uploaded_at')
      .eq('proposal_id', proposalId)
      .order('uploaded_at', { ascending: false });
    
    if (error) {
      console.error(`Error fetching documents for proposal ${proposalId}:`, error);
      return [];
    }

    console.log(`✅ Found ${data?.length || 0} documents for individual proposal`);
    return data || [];
  } catch (error) {
    console.error(`Error fetching documents:`, error);
    return [];
  }
}

export async function fetchProposalFeedback(proposalId: string) {
  try {
    const { data, error } = await supabase
      .from('proposal_feedback')
      .select(`
        id, 
        content, 
        created_at, 
        supervisor_id
      `)
      .eq('proposal_id', proposalId);
    
    if (error) {
      console.error(`Error fetching feedback for proposal ${proposalId}:`, error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error(`Error fetching feedback:`, error);
    return [];
  }
}

export async function fetchSupervisorName(supervisorId: string) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', supervisorId)
      .single();
    
    return data?.full_name;
  } catch (error) {
    console.error(`Error fetching supervisor name:`, error);
    return undefined;
  }
}

export async function fetchTeamSupervisors(teamId: string) {
  try {
    const { data: teamSupervisors, error: supervisorsError } = await supabase
      .from('team_supervisors')
      .select(`supervisor_id`)
      .eq('team_id', teamId);
    
    if (supervisorsError) {
      console.error(`Error fetching supervisors for team ${teamId}:`, supervisorsError);
      return [];
    }

    if (teamSupervisors && teamSupervisors.length > 0) {
      // Fetch supervisor details
      const supervisorIds = teamSupervisors.map(s => s.supervisor_id);
      const { data: supervisorProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, profile_image')
        .in('id', supervisorIds);
      
      return supervisorProfiles || [];
    }

    return [];
  } catch (error) {
    console.error(`Error fetching team supervisors:`, error);
    return [];
  }
}

export async function fetchMainSupervisor(supervisorId: string) {
  try {
    const { data: mainSupervisor, error: supervisorError } = await supabase
      .from('profiles')
      .select('id, full_name, profile_image')
      .eq('id', supervisorId)
      .single();
    
    if (!supervisorError && mainSupervisor) {
      return [mainSupervisor];
    }
    return [];
  } catch (error) {
    console.error(`Error fetching main supervisor:`, error);
    return [];
  }
}

// Fetch all supervisors for sharing functionality
export async function fetchAllSupervisors() {
  try {
    const { data: supervisors, error } = await supabase
      .from('profiles')
      .select('id, full_name, profile_image')
      .eq('role', 'supervisor')
      .order('full_name');
    
    if (error) {
      console.error('Error fetching all supervisors:', error);
      throw error;
    }

    return supervisors || [];
  } catch (error) {
    console.error('Error in fetchAllSupervisors:', error);
    throw error;
  }
}

export async function saveProposalFeedback(proposalId: string, supervisorId: string, content: string) {
  try {
    const { data, error } = await supabase
      .from('proposal_feedback')
      .insert({
        proposal_id: proposalId,
        supervisor_id: supervisorId,
        content: content
      })
      .select();
    
    if (error) {
      console.error("Error saving feedback:", error);
      throw error;
    }

    // Get the team ID for the proposal
    const { data: proposalData } = await supabase
      .from('proposals')
      .select('team_id')
      .eq('id', proposalId)
      .single();

    // If the proposal is part of a team, sync the feedback to all team members' proposals
    if (proposalData?.team_id) {
      await syncFeedbackWithTeam(proposalId, proposalData.team_id, content, supervisorId);
    }

    return data;
  } catch (error: any) {
    console.error("Error saving feedback:", error);
    toast.error("Failed to save feedback");
    throw error;
  }
}

// New function to sync feedback across team members' proposals
async function syncFeedbackWithTeam(sourceProposalId: string, teamId: string, content: string, supervisorId: string) {
  try {
    // Get all proposals for this team except the source proposal
    const { data: teamProposals, error: teamProposalsError } = await supabase
      .from('proposals')
      .select('id')
      .eq('team_id', teamId)
      .neq('id', sourceProposalId);
    
    if (teamProposalsError) {
      console.error(`Error fetching team proposals for feedback sync:`, teamProposalsError);
      return;
    }

    if (teamProposals && teamProposals.length > 0) {
      // Create feedback entries for all other team members' proposals
      const feedbackEntries = teamProposals.map(proposal => ({
        proposal_id: proposal.id,
        supervisor_id: supervisorId,
        content: content
      }));
      
      const { error: insertError } = await supabase
        .from('proposal_feedback')
        .insert(feedbackEntries);
      
      if (insertError) {
        console.error("Error syncing feedback with team:", insertError);
      } else {
        console.log("Successfully synced feedback to all team members");
      }
    }
  } catch (error) {
    console.error("Error in syncFeedbackWithTeam:", error);
  }
}

// IMPROVED: Enhanced function to safely ensure proposals exist for all team members
export async function ensureTeamProposalsExist(teamId: string, baseProposal: {
  title: string;
  description: string | null;
  company_name: string | null;
  supervisor_id: string | null;
  status: string;
  rejection_reason?: string | null;
}) {
  try {
    console.log(`Ensuring proposals exist for team ${teamId}`);
    
    // Get all team members
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId);

    if (teamMembersError || !teamMembers) {
      console.error("Error fetching team members:", teamMembersError);
      return false;
    }

    console.log(`Found ${teamMembers.length} team members for team ${teamId}`);

    // Check which members already have proposals for this team
    const memberIds = teamMembers.map(member => member.user_id);
    const { data: existingProposals, error: existingError } = await supabase
      .from('proposals')
      .select('student_id')
      .in('student_id', memberIds)
      .eq('team_id', teamId);

    if (existingError) {
      console.error("Error checking existing proposals:", existingError);
      return false;
    }

    const existingMemberIds = (existingProposals || []).map(p => p.student_id);
    const missingMemberIds = memberIds.filter(id => !existingMemberIds.includes(id));

    console.log(`${existingMemberIds.length} members already have proposals, ${missingMemberIds.length} are missing`);

    // Create proposals for missing members using individual inserts to avoid constraint issues
    if (missingMemberIds.length > 0) {
      const insertPromises = missingMemberIds.map(async (studentId) => {
        try {
          const { data: insertedProposal, error: insertError } = await supabase
            .from('proposals')
            .insert({
              student_id: studentId,
              team_id: teamId,
              title: baseProposal.title,
              description: baseProposal.description,
              company_name: baseProposal.company_name,
              supervisor_id: baseProposal.supervisor_id,
              status: baseProposal.status,
              rejection_reason: baseProposal.rejection_reason || null
            })
            .select()
            .single();

          if (insertError) {
            console.error(`Error creating proposal for student ${studentId}:`, insertError);
            return null;
          }

          console.log(`Successfully created proposal for student ${studentId}`);
          return insertedProposal;
        } catch (error) {
          console.error(`Exception creating proposal for student ${studentId}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(insertPromises);
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value !== null
      ).length;
      
      console.log(`Successfully created ${successCount} out of ${missingMemberIds.length} missing proposals`);
    }

    return true;
  } catch (error) {
    console.error("Error in ensureTeamProposalsExist:", error);
    return false;
  }
}

// Enhanced function to sync proposal status with team members
export async function syncProposalStatusWithTeam(proposalId: string, status: string, rejectionReason?: string) {
  try {
    // 1. Get proposal details including team_id and current status
    const { data: mainProposal, error: fetchError } = await supabase
      .from('proposals')
      .select('team_id, status')
      .eq('id', proposalId)
      .single();

    if (fetchError || !mainProposal?.team_id) {
      console.error('Proposal not found or no team', { fetchError });
      return { success: false, error: fetchError?.message || 'No team associated' };
    }

    // Skip if status is already the same
    if (mainProposal.status === status) {
      console.log('Proposal already has the target status');
      return { success: true, updatedCount: 0 };
    }

    // 2. Verify team members exist
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', mainProposal.team_id);

    if (teamError || !teamMembers?.length) {
      console.error('Invalid team composition', { teamError });
      return { success: false, error: teamError?.message || 'Empty team' };
    }

    // 3. Update all team proposals with simple update query
    const { data: updatedProposals, error: updateError } = await supabase
      .from('proposals')
      .update({
        status: status,
        rejection_reason: rejectionReason || null,
        updated_at: new Date().toISOString()
      })
      .eq('team_id', mainProposal.team_id)
      .neq('status', status) // Only update if status is different
      .select('id');

    if (updateError) {
      console.error('Bulk update failed', updateError);
      return { success: false, error: updateError.message };
    }

    const updatedCount = updatedProposals?.length || 0;
    console.log(`Successfully updated ${updatedCount} proposals`);

    return { 
      success: true, 
      updatedCount: updatedCount 
    };

  } catch (error) {
    console.error('Sync failed completely:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Function to share proposal with supervisors
export async function shareProposalWithSupervisors(proposalId: string, supervisorIds: string[]) {
  try {
    console.log(`Sharing proposal ${proposalId} with supervisors:`, supervisorIds);
    
    // Get proposal details
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('title, student_id, team_id, profiles!student_id(full_name)')
      .eq('id', proposalId)
      .single();

    if (proposalError) {
      console.error('Error fetching proposal:', proposalError);
      throw new Error(`Failed to fetch proposal details: ${proposalError.message}`);
    }

    // Create notifications for each supervisor
    const notifications = supervisorIds.map(supervisorId => ({
      user_id: supervisorId,
      title: 'Proposal Baru untuk Review',
      type: 'proposal_shared',
      message: `Proposal "${proposal.title}" dari ${proposal.profiles?.full_name} telah dibagikan kepada Anda untuk review`,
      related_id: proposalId
    }));

    const { error: notificationError } = await supabase
      .from('kp_notifications')
      .insert(notifications);

    if (notificationError) {
      console.error('Error creating notifications:', notificationError);
      throw new Error(`Failed to notify supervisors: ${notificationError.message}`);
    }

    console.log('Successfully shared proposal with supervisors');
    return true;
  } catch (error) {
    console.error('Error sharing proposal:', error);
    throw error;
  }
}

// Enhanced function to save document to all team members' proposals during initial submission
export async function saveDocumentToAllTeamProposals(
  sourceProposalId: string, 
  fileUrl: string, 
  fileName: string, 
  fileType: string | null, 
  uploadedBy: string
) {
  try {
    // First get the proposal to find the team
    const { data: proposalData, error: proposalError } = await supabase
      .from('proposals')
      .select('team_id')
      .eq('id', sourceProposalId)
      .single();

    if (proposalError || !proposalData?.team_id) {
      console.error("Error fetching proposal for document sync:", proposalError);
      return false;
    }

    // Get all proposals for this team
    const { data: teamProposals, error: teamProposalsError } = await supabase
      .from('proposals')
      .select('id')
      .eq('team_id', proposalData.team_id);

    if (teamProposalsError || !teamProposals) {
      console.error("Error fetching team proposals for document sync:", teamProposalsError);
      return false;
    }

    // Create document entries for all team proposals
    const documentEntries = teamProposals.map(proposal => ({
      proposal_id: proposal.id,
      file_name: fileName,
      file_url: fileUrl,
      file_type: fileType,
      uploaded_by: uploadedBy
    }));

    const { error: insertError } = await supabase
      .from('proposal_documents')
      .insert(documentEntries);

    if (insertError) {
      console.error("Error creating documents for team members:", insertError);
      return false;
    }

    console.log("Successfully saved document to all team members:", documentEntries.length);
    return true;
  } catch (error) {
    console.error("Error in saveDocumentToAllTeamProposals:", error);
    return false;
  }
}

// New function to create individual proposals for each team member during submission
export async function createProposalsForAllTeamMembers(
  teamId: string,
  teamMembers: any[],
  proposalData: {
    title: string;
    description: string;
    company_name: string;
    status: string;
  }
) {
  try {
    console.log(`Creating proposals for all ${teamMembers.length} team members`);
    
    // Create proposal entries for all team members using individual inserts
    const insertPromises = teamMembers.map(async (member) => {
      try {
        const { data: createdProposal, error: insertError } = await supabase
          .from('proposals')
          .insert({
            student_id: member.id,
            team_id: teamId,
            title: proposalData.title,
            description: proposalData.description,
            company_name: proposalData.company_name,
            status: proposalData.status
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Error creating proposal for member ${member.id}:`, insertError);
          return null;
        }

        console.log(`Successfully created proposal for member ${member.id}`);
        return createdProposal;
      } catch (error) {
        console.error(`Exception creating proposal for member ${member.id}:`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(insertPromises);
    const createdProposals = results
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<any>).value);

    console.log(`Successfully created ${createdProposals.length} out of ${teamMembers.length} proposals for team members`);
    return createdProposals;
  } catch (error) {
    console.error("Error in createProposalsForAllTeamMembers:", error);
    throw error;
  }
}
