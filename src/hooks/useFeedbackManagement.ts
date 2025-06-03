
import { useState } from 'react';
import { sendProposalFeedback } from '@/services/supervisor/feedbackService';

export const useFeedbackManagement = () => {
  const [feedbackContent, setFeedbackContent] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Handle sending feedback
  const handleSendFeedback = async (
    proposalId: string,
    supervisorId: string,
    feedback: string
  ): Promise<boolean> => {
    if (!proposalId || !supervisorId) {
      console.error('Missing proposalId or supervisorId');
      return false;
    }

    if (!feedback.trim()) {
      console.error('Empty feedback');
      return false;
    }

    setIsSubmittingFeedback(true);
    try {
      const result = await sendProposalFeedback(proposalId, supervisorId, feedback);
      if (result) {
        setFeedbackContent(''); // Clear content on success
      }
      return result;
    } finally {
      setIsSubmittingFeedback(false);
    }
  };
  
  // Submit feedback using the content from state
  const submitFeedback = async (
    proposalId: string,
    supervisorId: string
  ): Promise<boolean> => {
    return await handleSendFeedback(proposalId, supervisorId, feedbackContent);
  };

  return {
    feedbackContent,
    setFeedbackContent,
    isSubmittingFeedback,
    handleSendFeedback,
    submitFeedback
  };
};
