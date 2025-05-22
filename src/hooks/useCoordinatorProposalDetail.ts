
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useProposalData } from '@/hooks/useCoordinatorProposal';

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
    toast({
      title: "Downloading file",
      description: `Downloading ${fileName}`
    });
  };

  const handleApprove = async () => {
    if (!proposal) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', proposal.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Proposal berhasil disetujui",
        variant: "default"
      });
      setIsApproveDialogOpen(false);
    } catch (error: any) {
      console.error("Error approving proposal:", error);
      toast({
        title: "Error",
        description: `Failed to approve proposal: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!proposal) return;
    
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Harap berikan alasan penolakan",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        })
        .eq('id', proposal.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Proposal berhasil ditolak",
        variant: "default"
      });
      setIsRejectDialogOpen(false);
    } catch (error: any) {
      console.error("Error rejecting proposal:", error);
      toast({
        title: "Error",
        description: `Failed to reject proposal: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevision = async () => {
    if (!proposal) return;
    
    if (!revisionFeedback.trim()) {
      toast({
        title: "Error",
        description: "Harap berikan catatan revisi",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Now we can use the proper 'revision' status since it's allowed in the database
      const { error: proposalError } = await supabase
        .from('proposals')
        .update({ 
          status: 'revision',
          updated_at: new Date().toISOString(),
          rejection_reason: revisionFeedback
        })
        .eq('id', proposal.id);
        
      if (proposalError) throw proposalError;
      
      toast({
        title: "Success",
        description: "Permintaan revisi berhasil dikirim",
        variant: "default"
      });
      setIsRevisionDialogOpen(false);
    } catch (error: any) {
      console.error("Error requesting revision:", error);
      toast({
        title: "Error",
        description: `Failed to request revision: ${error.message}`,
        variant: "destructive"
      });
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
