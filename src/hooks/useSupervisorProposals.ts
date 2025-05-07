
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useProposals, Proposal } from '@/hooks/useProposals';

export function useSupervisorProposals() {
  const { user } = useAuth();
  const { proposals, loading: proposalsLoading, saveFeedback } = useProposals();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    if (proposals.length > 0 && !selectedProposal) {
      setSelectedProposal(proposals[0]);
    }
  }, [proposals, selectedProposal]);

  const handleSelectProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
  };

  const handleSendFeedback = async (feedback: string) => {
    if (!feedback.trim()) {
      toast.error('Harap masukkan feedback');
      return;
    }

    if (!selectedProposal?.id || !user?.id) {
      toast.error('Tidak dapat mengirim feedback');
      return;
    }

    try {
      await saveFeedback(selectedProposal.id, user.id, feedback);
      toast.success('Feedback berhasil dikirim');
      return true;
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast.error('Gagal mengirim feedback');
      return false;
    }
  };

  return {
    proposals,
    proposalsLoading,
    selectedProposal,
    setSelectedProposal,
    handleSelectProposal,
    handleSendFeedback,
    user,
  };
}
