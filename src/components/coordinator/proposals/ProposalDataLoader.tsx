
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Supervisor, fetchTeamSupervisors, fetchMainSupervisor } from '@/services/supervisorService';

interface ProposalDocument {
  id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
}

interface TeamMember {
  id: string;
  full_name: string;
  nim?: string;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at?: string;
  student: {
    id: string;
    full_name: string;
  };
  supervisors: Supervisor[];
  company_name?: string;
  team?: Team;
  documents: ProposalDocument[];
  rejectionReason?: string;
  team_id?: string | null;
  supervisor_id?: string | null;
}

interface UseProposalDataResult {
  proposal: Proposal | null;
  loading: boolean;
  supervisors: Supervisor[];
  fetchProposal: () => Promise<void>;
  handleUpdateSupervisors: (updatedSupervisors: Supervisor[]) => void;
}

export const useProposalData = (): UseProposalDataResult => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);

  const fetchProposal = async () => {
    if (!id) return;
      
    setLoading(true);
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
      const { data: documentsData, error: documentsError } = await supabase
        .from('proposal_documents')
        .select('id, file_name, file_url, file_type')
        .eq('proposal_id', id);
      
      if (documentsError) {
        console.error("Error fetching documents:", documentsError);
        throw documentsError;
      }

      // Initialize supervisors array
      let supervisorsList: Supervisor[] = [];

      // Fetch team data if available
      let teamData = null;
      if (proposalData.team_id) {
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select('id, name')
          .eq('id', proposalData.team_id)
          .single();
            
        if (teamError) {
          console.error("Error fetching team:", teamError);
        } else if (team) {
          // Fetch team members
          const { data: membersData, error: membersError } = await supabase
            .from('team_members')
            .select(`
              user_id,
              profiles:user_id(id, full_name, nim)
            `)
            .eq('team_id', team.id);
              
          if (membersError) {
            console.error("Error fetching team members:", membersError);
          } else {
            teamData = {
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
              supervisorsList = await fetchTeamSupervisors(team.id);
            } catch (error) {
              console.error("Error fetching team supervisors:", error);
            }
          }
        }
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
        documents: documentsData || [],
        rejectionReason: proposalData.rejection_reason,
        supervisors: supervisorsList
      };
      
      setProposal(fullProposal);
      setSupervisors(supervisorsList);
      console.log("Fetched proposal data:", fullProposal);
    } catch (error) {
      console.error("Error fetching proposal data:", error);
      toast.error("Gagal memuat data proposal");
      navigate('/coordinator/proposal-review');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSupervisors = (updatedSupervisors: Supervisor[]) => {
    if (!proposal) return;

    // Update the proposal state with new supervisors
    setProposal({
      ...proposal,
      supervisors: updatedSupervisors
    });

    setSupervisors(updatedSupervisors);
  };

  useEffect(() => {
    fetchProposal();
  }, [id, navigate]);

  return { 
    proposal, 
    loading, 
    supervisors,
    fetchProposal,
    handleUpdateSupervisors
  };
};
