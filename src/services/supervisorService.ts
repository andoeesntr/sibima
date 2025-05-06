
import { supabase } from '@/integrations/supabase/client';

export interface Supervisor {
  id: string;
  full_name: string;
  profile_image?: string;
}

export async function fetchTeamSupervisors(teamId: string): Promise<Supervisor[]> {
  try {
    const { data: teamSupervisors, error: supervisorsError } = await supabase
      .from('team_supervisors')
      .select(`
        supervisor_id,
        profiles:supervisor_id(id, full_name, profile_image)
      `)
      .eq('team_id', teamId);
    
    if (supervisorsError) {
      console.error(`Error fetching supervisors for team ${teamId}:`, supervisorsError);
      return [];
    }

    if (teamSupervisors && teamSupervisors.length > 0) {
      // Map to the proper format
      return teamSupervisors.map(ts => ({
        id: ts.profiles.id,
        full_name: ts.profiles.full_name,
        profile_image: ts.profiles.profile_image
      }));
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
