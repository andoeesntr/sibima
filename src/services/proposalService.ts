
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
        student:profiles!student_id (full_name),
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
