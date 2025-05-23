
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { fetchSupervisorProposals } from '@/services/supervisor';
import { useProposalFilters } from './useProposalFilters';
import { useFeedbackManagement } from './useFeedbackManagement';
import type { Proposal, FeedbackEntry, Document } from '@/types/supervisorProposals';

// Export types with the 'export type' syntax for isolatedModules
export type { Proposal, FeedbackEntry, Document };

export const useSupervisorProposals = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  
  const {
    activeTab,
    setActiveTab,
    activeStatus,
    handleStatusChange,
    selectedProposal,
    setSelectedProposal,
    filterProposals,
    selectProposal,
    handleSelectProposal,
    formatDate
  } = useProposalFilters();

  const {
    feedbackContent,
    setFeedbackContent,
    isSubmittingFeedback,
    handleSendFeedback,
    submitFeedback: baseSubmitFeedback
  } = useFeedbackManagement();

  // Fetch proposals for the supervisor
  useEffect(() => {
    const loadProposals = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const proposalsData = await fetchSupervisorProposals(user.id);
        setProposals(proposalsData);
      } catch (error) {
        console.error("Error loading proposals:", error);
        toast.error("Gagal memuat data proposal");
      } finally {
        setLoading(false);
      }
    };
    
    loadProposals();
  }, [user]);

  // Wrapper for submitFeedback that uses selected proposal
  const submitFeedback = async (): Promise<boolean> => {
    if (!selectedProposal || !user) {
      toast.error('Proposal tidak ditemukan');
      return false;
    }
    return await baseSubmitFeedback(selectedProposal.id, user.id);
  };

  // Select proposal by ID - updated to use our proposals state
  const selectProposalById = (id: string) => {
    selectProposal(id, proposals);
  };

  // We need to create an adapter for the handleSendFeedback function to match the expected signature
  const handleSendFeedbackAdapter = async (feedback: string): Promise<boolean> => {
    if (!selectedProposal || !user) {
      toast.error('Proposal tidak ditemukan');
      return false;
    }
    return await handleSendFeedback(selectedProposal.id, user.id, feedback);
  };

  return {
    proposals,
    loading,
    selectedProposal,
    setSelectedProposal,
    selectProposal: selectProposalById,
    activeTab,
    setActiveTab,
    handleSelectProposal,
    activeStatus,
    handleStatusChange,
    filterProposals,
    formatDate,
    feedbackContent,
    setFeedbackContent,
    isSubmittingFeedback,
    submitFeedback,
    handleSendFeedback: handleSendFeedbackAdapter,
    proposalsLoading: loading // Alias for loading to match expected prop name
  };
};

export default useSupervisorProposals;
