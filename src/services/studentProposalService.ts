
import { supabase } from '@/integrations/supabase/client';
import { ProposalType } from '@/types/student';
import { toast } from 'sonner';
import { fetchTeamSupervisors } from './supervisorService';

export const fetchStudentProposals = async (userId: string): Promise<ProposalType[]> => {
  try {
    // Fetch all proposals by the student
    const { data: proposalsData, error: proposalsError } = await supabase
      .from('proposals')
      .select(`
        id,
        title,
        status,
        created_at,
        supervisor_id,
        company_name,
        team_id,
        rejection_reason
      `)
      .eq('student_id', userId)
      .order('created_at', { ascending: false });
    
    if (proposalsError) {
      console.error('Error fetching proposals:', proposalsError);
      toast.error('Gagal memuat data proposal');
      return [];
    }
    
    if (!proposalsData || proposalsData.length === 0) {
      return [];
    }

    // Process proposals data
    const processedProposals: ProposalType[] = [];
    
    for (const proposal of proposalsData) {
      let supervisorData = null;
      let teamData = null;
      let supervisors = [];
      
      // Fetch supervisor data if exists
      if (proposal.supervisor_id) {
        const { data: supervisor, error: supervisorError } = await supabase
          .from('profiles')
          .select('id, full_name, profile_image')
          .eq('id', proposal.supervisor_id)
          .single();
          
        if (!supervisorError) {
          supervisorData = supervisor;
          // Add to supervisors array if found
          if (supervisor) {
            supervisors.push({
              id: supervisor.id,
              full_name: supervisor.full_name,
              profile_image: supervisor.profile_image
            });
          }
        }
      }
      
      // Fetch team data if exists
      if (proposal.team_id) {
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select('id, name')
          .eq('id', proposal.team_id)
          .single();
          
        if (!teamError) {
          teamData = team;
          
          // Fetch team supervisors if team exists
          try {
            const teamSupervisors = await fetchTeamSupervisors(proposal.team_id);
            // Add team supervisors to the supervisors array
            if (teamSupervisors && teamSupervisors.length > 0) {
              supervisors = teamSupervisors;
            }
          } catch (error) {
            console.error("Error fetching team supervisors:", error);
          }
        }
      }
      
      processedProposals.push({
        id: proposal.id,
        title: proposal.title,
        status: proposal.status || 'draft',
        submissionDate: proposal.created_at,
        created_at: proposal.created_at,
        supervisor: supervisorData,
        supervisors: supervisors,
        company_name: proposal.company_name,
        team: teamData,
        team_id: proposal.team_id,
        rejectionReason: proposal.rejection_reason
      });
    }
    
    return processedProposals;
  } catch (error) {
    console.error('Error fetching proposals:', error);
    toast.error('Gagal memuat data proposal');
    return [];
  }
};
