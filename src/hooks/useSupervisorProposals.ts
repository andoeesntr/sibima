
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useProposals, Proposal } from '@/hooks/useProposals';
import { formatDate as formatProposalDate } from '@/utils/dateUtils';
import { saveProposalFeedback } from '@/services/proposalService';

export function useSupervisorProposals() {
  const { user } = useAuth();
  const { proposals, loading: proposalsLoading, refreshProposals } = useProposals();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [activeTab, setActiveTab] = useState<string>('detail');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (proposals.length > 0 && !selectedProposal) {
      setSelectedProposal(proposals[0]);
    }
  }, [proposals, selectedProposal]);

  const handleSelectProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
  };

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    // If changing status filter, reset the selected proposal
    if (status !== 'all') {
      const filteredProposals = filterProposals(proposals, status);
      if (filteredProposals.length > 0) {
        setSelectedProposal(filteredProposals[0]);
      } else {
        setSelectedProposal(null);
      }
    } else if (proposals.length > 0) {
      setSelectedProposal(proposals[0]);
    }
  };

  const filterProposals = (proposalList: Proposal[], status: string): Proposal[] => {
    if (status === 'all') return proposalList;
    return proposalList.filter(p => p.status === status);
  };

  const saveFeedback = async (proposalId: string, supervisorId: string, content: string) => {
    try {
      await saveProposalFeedback(proposalId, supervisorId, content);
      refreshProposals();
      return true;
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }
  };

  const submitFeedback = async () => {
    if (!feedbackContent.trim()) {
      toast.error('Harap masukkan feedback');
      return false;
    }

    if (!selectedProposal?.id || !user?.id) {
      toast.error('Tidak dapat mengirim feedback');
      return false;
    }

    setIsSubmittingFeedback(true);
    try {
      await saveFeedback(selectedProposal.id, user.id, feedbackContent);
      toast.success('Feedback berhasil dikirim');
      setFeedbackContent('');
      return true;
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast.error('Gagal mengirim feedback');
      return false;
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const formatDate = (dateString: string) => {
    return formatProposalDate(dateString);
  };

  return {
    proposals,
    proposalsLoading,
    selectedProposal,
    setSelectedProposal,
    handleSelectProposal,
    handleSendFeedback: async (feedback: string) => {
      setFeedbackContent(feedback);
      return submitFeedback();
    },
    user,
    // Additional properties needed by the dashboard
    loading: proposalsLoading,
    activeTab,
    setActiveTab,
    formatDate,
    feedbackContent,
    setFeedbackContent,
    isSubmittingFeedback,
    submitFeedback,
    filterProposals,
    handleStatusChange,
    activeStatus,
    saveFeedback
  };
}
