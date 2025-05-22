import { supabase } from '@/integrations/supabase/client';
import { Proposal } from '@/types/proposals';
import { toast } from 'sonner';

export async function fetchProposalsList() {
  try {
    // Fetch proposals with student information and team data
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
      `);
    
    if (error) {
      console.error("Error fetching proposals:", error);
      throw error;
    }

    console.log("Raw proposal data:", data);
    return data || [];
  } catch (error: any) {
    console.error("Error fetching proposals:", error);
    toast.error("Failed to load proposals");
    throw error;
  }
}

export async function fetchProposalDocuments(proposalId: string) {
  try {
    const { data, error } = await supabase
      .from('proposal_documents')
      .select('id, file_name, file_url, file_type, uploaded_at')
      .eq('proposal_id', proposalId)
      .order('uploaded_at', { ascending: false }); // Sort by upload date, newest first
    
    if (error) {
      console.error(`Error fetching documents for proposal ${proposalId}:`, error);
      throw error;
    }

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

    return data;
  } catch (error: any) {
    console.error("Error saving feedback:", error);
    toast.error("Failed to save feedback");
    throw error;
  }
}

// Improved function to sync proposal status with team members
export async function syncProposalStatusWithTeam(proposalId: string, status: string, rejectionReason?: string) {
  try {
    // First get the proposal to find the team
    const { data: proposalData, error: proposalError } = await supabase
      .from('proposals')
      .select('team_id, student_id, title, description, company_name, supervisor_id')
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposalData?.team_id) {
      console.error("Error fetching proposal for team sync:", proposalError);
      return;
    }

    // Get all team members
    const { data: teamMembersData, error: teamMembersError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', proposalData.team_id);

    if (teamMembersError || !teamMembersData) {
      console.error("Error fetching team members for sync:", teamMembersError);
      return;
    }

    // Get all existing proposals for these team members
    const memberIds = teamMembersData.map(member => member.user_id);
    
    // If there are no members other than the proposer, we don't need to sync
    if (memberIds.length <= 1) {
      console.log("No other team members to sync with.");
      return;
    }

    // Filter out the original proposer's ID to avoid duplication
    const otherMemberIds = memberIds.filter(id => id !== proposalData.student_id);

    if (otherMemberIds.length === 0) {
      console.log("No other team members to sync with.");
      return;
    }

    // Check if the other members already have proposals
    const { data: existingProposals, error: existingProposalsError } = await supabase
      .from('proposals')
      .select('id, student_id')
      .in('student_id', otherMemberIds)
      .eq('team_id', proposalData.team_id);

    if (existingProposalsError) {
      console.error("Error checking existing proposals:", existingProposalsError);
      return;
    }

    console.log("Existing proposals for team members:", existingProposals);

    // For members who already have proposals, update their status
    if (existingProposals && existingProposals.length > 0) {
      const updatePromises = existingProposals.map(proposal => {
        return supabase
          .from('proposals')
          .update({ 
            status, 
            rejection_reason: rejectionReason || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', proposal.id);
      });

      const updateResults = await Promise.all(updatePromises);
      console.log("Update results for existing proposals:", updateResults);
    }

    // Calculate which member IDs don't have proposals yet
    const memberIdsWithProposals = (existingProposals || []).map(p => p.student_id);
    const memberIdsWithoutProposals = otherMemberIds.filter(
      id => !memberIdsWithProposals.includes(id)
    );

    console.log("Members without proposals:", memberIdsWithoutProposals);

    // For members who don't have proposals, create new ones
    if (memberIdsWithoutProposals.length > 0) {
      // Create new proposals for team members without one
      const newProposals = memberIdsWithoutProposals.map(studentId => ({
        student_id: studentId,
        title: proposalData.title,
        description: proposalData.description,
        company_name: proposalData.company_name,
        supervisor_id: proposalData.supervisor_id,
        status,
        rejection_reason: rejectionReason || null,
        team_id: proposalData.team_id
      }));

      const { data: insertedProposals, error: insertError } = await supabase
        .from('proposals')
        .insert(newProposals)
        .select();

      if (insertError) {
        console.error("Error creating proposals for team members:", insertError);
      } else {
        console.log("Created new proposals for team members:", insertedProposals);
      }
    }

    return true;
  } catch (error) {
    console.error("Error syncing proposal status with team:", error);
    return false;
  }
}
