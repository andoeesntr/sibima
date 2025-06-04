
import { useState } from 'react';
import { toast } from 'sonner';
import { useProposalData } from '@/hooks/useCoordinatorProposal';
import { ProposalApprovalService } from '@/services/proposalApprovalService';

export const useCoordinatorProposalDetail = () => {
  const { proposal, loading, supervisors, handleUpdateSupervisors } = useProposalData();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewName, setPreviewName] = useState('');

  const handlePreviewDocument = (url: string, name: string) => {
    setPreviewUrl(url);
    setPreviewName(name);
    setPreviewDialogOpen(true);
  };

  const handleDownloadFile = (url: string, fileName: string) => {
    window.open(url, '_blank');
    toast("Downloading file", {
      description: `Downloading ${fileName}`
    });
  };

  const handleApprove = async () => {
    if (!proposal) return;
    
    setIsSubmitting(true);
    
    try {
      console.log(`🚀 Starting approval process using stored procedure for proposal ${proposal.id}`);
      
      const result = await ProposalApprovalService.approveProposal(proposal.id);
      
      if (result.success) {
        // Enhanced success message
        let successMessage = result.message;
        if (result.affectedProposals && result.affectedProposals > 1) {
          successMessage += ` (${result.affectedProposals} anggota tim)`;
        }
        
        toast.success(successMessage);
        
        // Show additional info for team approvals
        if (result.teamId) {
          console.log(`👥 Team approval completed for team: ${result.teamId}`);
        }
        
        // Warning for partial failures
        if (result.failedUpdates && result.failedUpdates.length > 0) {
          console.warn('⚠️ Some proposals failed to update:', result.failedUpdates);
          toast.warning(`${result.failedUpdates.length} proposal gagal diupdate dari total ${result.affectedProposals}`);
        }
        
        setIsApproveDialogOpen(false);
        // Refresh the proposal data would be handled by parent component
      } else {
        toast.error(result.message);
        if (result.errors) {
          result.errors.forEach(error => {
            console.error('📋 Approval error detail:', error);
          });
        }
        
        // Log bulk error if available
        if (result.bulkError) {
          console.error('💥 Bulk operation failed:', result.bulkError);
        }
      }
    } catch (error: any) {
      console.error("💥 Unexpected error during approval:", error);
      toast.error(`Unexpected error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!proposal) return;
    
    if (!rejectionReason.trim()) {
      toast.error("Harap berikan alasan penolakan");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log(`🚫 Starting rejection process using stored procedure for proposal ${proposal.id}`);
      
      const result = await ProposalApprovalService.rejectProposal(proposal.id, rejectionReason);
      
      if (result.success) {
        let successMessage = result.message;
        if (result.affectedProposals && result.affectedProposals > 1) {
          successMessage += ` (${result.affectedProposals} anggota tim)`;
        }
        
        toast.success(successMessage);
        setIsRejectDialogOpen(false);
        setRejectionReason(''); // Clear the reason
      } else {
        toast.error(result.message);
        if (result.errors) {
          result.errors.forEach(error => {
            console.error('📋 Rejection error detail:', error);
          });
        }
      }
    } catch (error: any) {
      console.error("💥 Unexpected error during rejection:", error);
      toast.error(`Unexpected error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevision = async () => {
    if (!proposal) return;
    
    if (!revisionFeedback.trim()) {
      toast.error("Harap berikan catatan revisi");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log(`📝 Starting revision process using stored procedure for proposal ${proposal.id}`);
      
      const result = await ProposalApprovalService.requestRevision(proposal.id, revisionFeedback);
      
      if (result.success) {
        let successMessage = result.message;
        if (result.affectedProposals && result.affectedProposals > 1) {
          successMessage += ` (${result.affectedProposals} anggota tim)`;
        }
        
        toast.success(successMessage);
        setIsRevisionDialogOpen(false);
        setRevisionFeedback(''); // Clear the feedback
      } else {
        toast.error(result.message);
        if (result.errors) {
          result.errors.forEach(error => {
            console.error('📋 Revision error detail:', error);
          });
        }
      }
    } catch (error: any) {
      console.error("💥 Unexpected error during revision:", error);
      toast.error(`Unexpected error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    proposal,
    loading,
    supervisors,
    isApproveDialogOpen,
    setIsApproveDialogOpen,
    isRejectDialogOpen,
    setIsRejectDialogOpen,
    isRevisionDialogOpen,
    setIsRevisionDialogOpen,
    rejectionReason,
    setRejectionReason,
    revisionFeedback,
    setRevisionFeedback,
    isSubmitting,
    previewDialogOpen,
    setPreviewDialogOpen,
    previewUrl,
    previewName,
    handleUpdateSupervisors,
    handlePreviewDocument,
    handleDownloadFile,
    handleApprove,
    handleReject,
    handleRevision
  };
};
