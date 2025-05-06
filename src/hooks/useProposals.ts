import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Proposal, ProposalStatus } from '@/types/proposals';
import { 
  fetchProposalsList, 
  fetchProposalDocuments, 
  fetchProposalFeedback,
  fetchSupervisorName,
  fetchTeamSupervisors,
  fetchMainSupervisor,
  saveProposalFeedback 
} from '@/services/proposalService';
import { transformProposalData } from '@/utils/proposalUtils';

// Change from 'export' to 'export type' for type re-exports
export type { Proposal, ProposalStatus } from '@/types/proposals';

export const useProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      
      const rawProposalsData = await fetchProposalsList();

      // Process each proposal to get complete data with documents and feedback
      const proposalsWithDetails = await Promise.all(
        rawProposalsData.map(async (proposal) => {
          // Fetch documents
          const documentData = await fetchProposalDocuments(proposal.id);
          
          // Fetch feedback
          const feedbackData = await fetchProposalFeedback(proposal.id);

          // Fetch supervisor names for feedback
          let feedbackWithNames = [];
          if (feedbackData && feedbackData.length > 0) {
            feedbackWithNames = await Promise.all(
              feedbackData.map(async (feedback) => {
                const supervisorName = await fetchSupervisorName(feedback.supervisor_id);
                
                return {
                  ...feedback,
                  supervisor_name: supervisorName
                };
              })
            );
          }

          // Get supervisors - either from team or main supervisor
          let supervisors = [];
          if (proposal.team_id) {
            supervisors = await fetchTeamSupervisors(proposal.team_id);
          }
          
          // If no team supervisors found, use the main supervisor
          if (supervisors.length === 0 && proposal.supervisor_id) {
            supervisors = await fetchMainSupervisor(proposal.supervisor_id);
          }

          return await transformProposalData(
            proposal, 
            documentData, 
            feedbackWithNames, 
            supervisors
          );
        })
      );
      
      setProposals(proposalsWithDetails);
      console.log("Fetched proposals with details:", proposalsWithDetails);
    } catch (error: any) {
      console.error("Error fetching proposals:", error);
      toast.error("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  };

  // Function to save feedback to the database
  const saveFeedback = async (proposalId: string, supervisorId: string, content: string) => {
    try {
      const data = await saveProposalFeedback(proposalId, supervisorId, content);
      
      // Refresh proposals after adding feedback
      await fetchProposals();
      return data;
    } catch (error: any) {
      // Error handling is already in the service function
      throw error;
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return {
    proposals,
    loading,
    fetchProposals,
    saveFeedback
  };
};
