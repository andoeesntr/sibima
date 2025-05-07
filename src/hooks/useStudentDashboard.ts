
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { fetchTeamSupervisors, fetchMainSupervisor } from '@/services/supervisorService';
import { ProposalType, TeamType, TeamMember } from '@/types/student';

export const useStudentDashboard = () => {
  const { user, profile } = useAuth();
  const [proposals, setProposals] = useState<ProposalType[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ProposalType | null>(null);
  const [team, setTeam] = useState<TeamType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user, profile]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
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
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });
      
      if (proposalsError) {
        console.error('Error fetching proposals:', proposalsError);
        toast.error('Gagal memuat data proposal');
        return;
      }
      
      if (!proposalsData || proposalsData.length === 0) {
        setProposals([]);
        setSelectedProposal(null);
        setLoading(false);
        return;
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
      
      setProposals(processedProposals);
      setSelectedProposal(processedProposals[0]);
      
      // Fetch team data for the selected proposal
      let proposalToUseForTeam = processedProposals[0];
      await fetchTeamData(proposalToUseForTeam);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamData = async (proposal: ProposalType) => {
    try {
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
        
        // Fetch all team supervisors using team_supervisors service
        let supervisors = [];
        if (proposal.team_id) {
          try {
            const teamSupervisors = await fetchTeamSupervisors(proposal.team_id);
            supervisors = teamSupervisors.map(supervisor => ({
              id: supervisor.id,
              name: supervisor.full_name,
              profile_image: supervisor.profile_image
            }));
          } catch (error) {
            console.error("Error fetching team supervisors:", error);
            // Fallback to main supervisor if team supervisors fetch fails
            if (proposal.supervisor) {
              supervisors.push({
                id: proposal.supervisor.id,
                name: proposal.supervisor.full_name,
                profile_image: proposal.supervisor.profile_image
              });
            }
          }
        } else if (proposal.supervisor) {
          // Fallback if no team_id
          supervisors.push({
            id: proposal.supervisor.id,
            name: proposal.supervisor.full_name,
            profile_image: proposal.supervisor.profile_image
          });
        }
        
        // If we have supervisors in the proposal object, use them instead
        if (proposal.supervisors && proposal.supervisors.length > 0) {
          supervisors = proposal.supervisors.map(supervisor => ({
            id: supervisor.id,
            name: supervisor.full_name,
            profile_image: supervisor.profile_image
          }));
        }
        
        setTeam({
          id: proposal.team.id,
          name: proposal.team.name,
          members: teamMembers,
          supervisors: supervisors
        });
      } else {
        // Create a temporary team based on the user
        if (profile && user) {
          const supervisors = [];
          if (proposal.supervisors && proposal.supervisors.length > 0) {
            // Use supervisors from the proposal object
            proposal.supervisors.forEach(supervisor => {
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
          
          setTeam({
            id: 'temp-' + proposal.id,
            name: `Tim ${profile.full_name || 'KP'}`,
            members: [{
              id: user.id,
              full_name: profile.full_name || 'Unnamed',
              nim: profile.nim,
              profile_image: profile.profile_image
            }],
            supervisors: supervisors
          });
        }
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    }
  };

  const handleSelectProposal = (proposal: ProposalType) => {
    setSelectedProposal(proposal);
    // Update team data when proposal changes
    fetchTeamData(proposal);
  };

  return {
    proposals,
    selectedProposal,
    team,
    loading,
    handleSelectProposal
  };
};
