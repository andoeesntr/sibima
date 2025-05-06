
import { supabase } from '@/integrations/supabase/client';

export interface Supervisor {
  id: string;
  full_name: string;
  profile_image?: string;
}

export async function fetchTeamSupervisors(teamId: string): Promise<Supervisor[]> {
  try {
    // First get the supervisor_ids from team_supervisors table
    const { data: teamSupervisors, error: supervisorsError } = await supabase
      .from('team_supervisors')
      .select('supervisor_id')
      .eq('team_id', teamId);
    
    if (supervisorsError) {
      console.error(`Error fetching supervisor ids for team ${teamId}:`, supervisorsError);
      return [];
    }

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
