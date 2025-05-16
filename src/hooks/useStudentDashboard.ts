
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
      console.log('Fetched proposals:', proposalsList);
      
      // Add studentId to each proposal for use with the evaluation system
      const proposalsWithStudentId = proposalsList.map(proposal => ({
        ...proposal,
        studentId: user.id
      }));
      
      setProposals(proposalsWithStudentId);
      
      if (proposalsWithStudentId.length > 0) {
        // Use the first proposal as default selection
        setSelectedProposal(proposalsWithStudentId[0]);
        
        // Fetch team data for the selected proposal
        const teamData = await fetchTeamData(proposalsWithStudentId[0], profile, user);
        console.log('Fetched team data:', teamData);
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

  // Compute derived state
  const hasActiveProposal = proposals.some(p => 
    ['submitted', 'revision'].includes(p.status)
  );
  
  const isInTeam = !!team;
  const lastTeam = team;

  return {
    proposals,
    selectedProposal,
    team,
    loading,
    handleSelectProposal,
    hasActiveProposal,
    isInTeam,
    lastTeam
  };
};
