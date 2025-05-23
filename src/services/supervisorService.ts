
import { supabase } from '@/integrations/supabase/client';

export interface Supervisor {
  id: string;
  full_name: string;
  profile_image?: string;
}

export async function fetchTeamSupervisors(teamId: string): Promise<Supervisor[]> {
  try {
    console.log(`Fetching supervisors for team ${teamId}`);
    
    // First get the supervisor_ids from team_supervisors table
    const { data: teamSupervisors, error: supervisorsError } = await supabase
      .from('team_supervisors')
      .select('supervisor_id')
      .eq('team_id', teamId);
    
    if (supervisorsError) {
      console.error(`Error fetching supervisor ids for team ${teamId}:`, supervisorsError);
      return [];
    }

    console.log(`Found ${teamSupervisors?.length || 0} supervisor IDs for team ${teamId}:`, teamSupervisors);

    // If we have supervisor ids, fetch their profile details
    if (teamSupervisors && teamSupervisors.length > 0) {
      // Extract supervisor IDs
      const supervisorIds = teamSupervisors.map(s => s.supervisor_id);
      
      // Fetch the profile details for these supervisors
      const { data: supervisorProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, profile_image')
        .in('id', supervisorIds);
        
      if (profilesError) {
        console.error(`Error fetching supervisor profiles:`, profilesError);
        return [];
      }
      
      console.log(`Fetched supervisor profiles:`, supervisorProfiles);
      return supervisorProfiles || [];
    }

    return [];
  } catch (error) {
    console.error(`Error fetching team supervisors:`, error);
    return [];
  }
}

export async function fetchMainSupervisor(supervisorId: string): Promise<Supervisor[]> {
  try {
    console.log(`Fetching main supervisor with ID ${supervisorId}`);
    
    const { data: mainSupervisor, error: supervisorError } = await supabase
      .from('profiles')
      .select('id, full_name, profile_image')
      .eq('id', supervisorId)
      .single();
    
    if (!supervisorError && mainSupervisor) {
      console.log(`Fetched main supervisor:`, mainSupervisor);
      return [mainSupervisor];
    }
    return [];
  } catch (error) {
    console.error(`Error fetching main supervisor:`, error);
    return [];
  }
}

export async function fetchProposalSupervisors(proposalId: string): Promise<Supervisor[]> {
  try {
    console.log(`Fetching supervisors for proposal ${proposalId}`);
    
    // First get the proposal to find the team and main supervisor
    const { data: proposalData, error: proposalError } = await supabase
      .from('proposals')
      .select('team_id, supervisor_id')
      .eq('id', proposalId)
      .single();
      
    if (proposalError) {
      console.error(`Error fetching proposal ${proposalId}:`, proposalError);
      return [];
    }
    
    // If the proposal has a team, fetch team supervisors
    if (proposalData.team_id) {
      return await fetchTeamSupervisors(proposalData.team_id);
    }
    
    // If no team but has supervisor, fetch main supervisor
    if (proposalData.supervisor_id) {
      return await fetchMainSupervisor(proposalData.supervisor_id);
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching proposal supervisors:`, error);
    return [];
  }
}
