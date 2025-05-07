
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ProposalType, TeamType } from '@/types/student';
import { fetchStudentProposals } from '@/services/studentProposalService';
import { fetchTeamData } from '@/services/teamService';

export const useStudentDashboard = () => {
  const { user, profile } = useAuth();
  const [proposals, setProposals] = useState<ProposalType[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ProposalType | null>(null);
  const [team, setTeam] = useState<TeamType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch all proposals
      const proposalsList = await fetchStudentProposals(user.id);
      
      setProposals(proposalsList);
      
      if (proposalsList.length > 0) {
        // Use the first proposal as default selection
        setSelectedProposal(proposalsList[0]);
        
        // Fetch team data for the selected proposal
        const teamData = await fetchTeamData(proposalsList[0], profile, user);
        setTeam(teamData);
      } else {
        setSelectedProposal(null);
        setTeam(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, profile]);

  const handleSelectProposal = async (proposal: ProposalType) => {
    setSelectedProposal(proposal);
    // Update team data when proposal changes
    const teamData = await fetchTeamData(proposal, profile, user);
    setTeam(teamData);
  };

  return {
    proposals,
    selectedProposal,
    team,
    loading,
    handleSelectProposal
  };
};
