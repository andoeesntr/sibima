
import { supabase } from '@/integrations/supabase/client';
import { TeamType, TeamMember, TeamSupervisor } from '@/types/student';
import { fetchTeamSupervisors } from './supervisorService';

export const fetchTeamData = async (proposal: any, profile: any, user: any): Promise<TeamType | null> => {
  try {
    console.log('Fetching team data for proposal:', proposal);
    // Fetch team members if we have team data
    if (proposal.team) {
      const teamMembers: TeamMember[] = [];
      
      // Fetch team members using team_members table
      const { data: teamMembersData, error: teamMembersError } = await supabase
        .from('team_members')
        .select(`
          profiles:user_id (id, full_name, nim, profile_image)
        `)
        .eq('team_id', proposal.team.id);
      
      if (!teamMembersError && teamMembersData) {
        for (const memberData of teamMembersData) {
          if (memberData.profiles) {
            teamMembers.push({
              id: memberData.profiles.id,
              full_name: memberData.profiles.full_name || 'Unnamed',
              nim: memberData.profiles.nim,
              profile_image: memberData.profiles.profile_image
            });
          }
        }
      }
      
      // If no team members found in the team_members table, add the current user
      if (teamMembers.length === 0 && profile && user) {
        teamMembers.push({
          id: user.id,
          full_name: profile.full_name || 'Unnamed',
          nim: profile.nim,
          profile_image: profile.profile_image
        });
      }
      
      // Always fetch team supervisors using the team_supervisors service
      let supervisors: TeamSupervisor[] = [];
      if (proposal.team.id) {
        try {
          console.log('Fetching supervisors for team ID:', proposal.team.id);
          const teamSupervisors = await fetchTeamSupervisors(proposal.team.id);
          console.log('Team supervisors fetched:', teamSupervisors);
          
          // Map supervisors to the expected format
          supervisors = teamSupervisors.map(supervisor => ({
            id: supervisor.id,
            name: supervisor.full_name,
            profile_image: supervisor.profile_image
          }));
          
          console.log('Mapped supervisors:', supervisors);
        } catch (error) {
          console.error("Error fetching team supervisors:", error);
        }
      }
      
      // Fallback: If no team supervisors found, try to use supervisors from proposal
      if (supervisors.length === 0 && proposal.supervisors && proposal.supervisors.length > 0) {
        console.log('Using supervisors from proposal object as fallback:', proposal.supervisors);
        supervisors = proposal.supervisors.map(supervisor => ({
          id: supervisor.id,
          name: supervisor.full_name,
          profile_image: supervisor.profile_image
        }));
      }
      
      console.log('Final supervisors for team card:', supervisors);
      
      return {
        id: proposal.team.id,
        name: proposal.team.name,
        members: teamMembers,
        supervisors: supervisors
      };
    } else {
      // Create a temporary team based on the user
      if (profile && user) {
        const supervisors: TeamSupervisor[] = [];
        
        // Try to get supervisors from proposal object
        if (proposal.supervisors && proposal.supervisors.length > 0) {
          console.log('Using supervisors from proposal object for temp team:', proposal.supervisors);
          proposal.supervisors.forEach((supervisor: any) => {
            supervisors.push({
              id: supervisor.id,
              name: supervisor.full_name,
              profile_image: supervisor.profile_image
            });
          });
        } else if (proposal.supervisor) {
          supervisors.push({
            id: proposal.supervisor.id,
            name: proposal.supervisor.full_name,
            profile_image: proposal.supervisor.profile_image
          });
        }
        
        return {
          id: 'temp-' + proposal.id,
          name: `Tim ${profile.full_name || 'KP'}`,
          members: [{
            id: user.id,
            full_name: profile.full_name || 'Unnamed',
            nim: profile.nim,
            profile_image: profile.profile_image
          }],
          supervisors: supervisors
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching team data:', error);
    return null;
  }
};
