
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Proposal, ProposalDocument } from '@/types/coordinator/proposal';
import { fetchTeamSupervisors, fetchMainSupervisor, Supervisor } from '@/services/supervisorService';

export const fetchProposalById = async (id: string): Promise<Proposal | null> => {
  try {
    // Fetch proposal data
    const { data: proposalData, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        id, 
        title,
        description,
        status,
        created_at,
        updated_at,
        company_name,
        team_id,
        supervisor_id,
        rejection_reason,
        student:profiles!student_id(id, full_name)
      `)
      .eq('id', id)
      .single();
        
    if (proposalError) {
      console.error("Error fetching proposal:", proposalError);
      throw proposalError;
    }
    
    // Fetch documents
    const documents = await fetchProposalDocuments(id);

    // Fetch team data if available
    let teamData = null;
    let supervisorsList: Supervisor[] = [];

    if (proposalData.team_id) {
      const { teamData: team, supervisorsList: supervisors } = await fetchProposalTeamData(proposalData.team_id);
      teamData = team;
      supervisorsList = supervisors;
    }

    // If no team supervisors found but proposal has main supervisor, fetch it
    if (supervisorsList.length === 0 && proposalData.supervisor_id) {
      try {
        const mainSupervisor = await fetchMainSupervisor(proposalData.supervisor_id);
        if (mainSupervisor.length > 0) {
          supervisorsList = mainSupervisor;
        }
      } catch (error) {
        console.error("Error fetching main supervisor:", error);
      }
    }

    const fullProposal: Proposal = {
      ...proposalData,
      team: teamData,
      documents: documents || [],
      rejectionReason: proposalData.rejection_reason,
      supervisors: supervisorsList
    };
    
    return fullProposal;
  } catch (error) {
    console.error("Error fetching proposal data:", error);
    return null;
  }
};

export const fetchProposalDocuments = async (proposalId: string): Promise<ProposalDocument[]> => {
  try {
    const { data: documentsData, error: documentsError } = await supabase
      .from('proposal_documents')
      .select('id, file_name, file_url, file_type')
      .eq('proposal_id', proposalId);
    
    if (documentsError) {
      console.error("Error fetching documents:", documentsError);
      throw documentsError;
    }

    return documentsData || [];
  } catch (error) {
    console.error("Error fetching proposal documents:", error);
    return [];
  }
};

export const fetchProposalTeamData = async (teamId: string) => {
  try {
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', teamId)
      .single();
        
    if (teamError) {
      console.error("Error fetching team:", teamError);
      return { teamData: null, supervisorsList: [] };
    }
    
    // Fetch team members
    const { data: membersData, error: membersError } = await supabase
      .from('team_members')
      .select(`
        user_id,
        profiles:user_id(id, full_name, nim)
      `)
      .eq('team_id', teamId);
        
    if (membersError) {
      console.error("Error fetching team members:", membersError);
      return { teamData: team, supervisorsList: [] };
    }
    
    const teamData = {
      id: team.id,
      name: team.name,
      members: membersData.map(member => ({
        id: member.profiles.id,
        full_name: member.profiles.full_name,
        nim: member.profiles.nim
      }))
    };

    // Fetch team supervisors using the service function
    try {
      const supervisorsList = await fetchTeamSupervisors(teamId);
      return { teamData, supervisorsList };
    } catch (error) {
      console.error("Error fetching team supervisors:", error);
      return { teamData, supervisorsList: [] };
    }
  } catch (error) {
    console.error("Error fetching team data:", error);
    return { teamData: null, supervisorsList: [] };
  }
};
