
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useProposalData } from '@/hooks/useCoordinatorProposal';
import ProposalLoading from '@/components/coordinator/proposals/ProposalLoading';
import NotFoundMessage from '@/components/coordinator/proposals/NotFoundMessage';
import ProposalHeader from '@/components/coordinator/proposals/ProposalHeader';
import ProposalDetails from '@/components/coordinator/proposals/ProposalDetails';
import TeamInfo from '@/components/coordinator/proposals/TeamInfo';
import ActionDialogs from '@/components/coordinator/proposals/ActionDialogs';
import DocumentPreview from '@/components/coordinator/proposals/DocumentPreview';
import ProposalActions from '@/components/coordinator/proposals/ProposalActions';
import SupervisorEditDialog from '@/components/coordinator/proposals/SupervisorEditDialog';
import { Supervisor } from '@/services/supervisorService';

const statusColors = {
  draft: "bg-gray-500",
  submitted: "bg-yellow-500",
  reviewed: "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
};

const statusLabels = {
  draft: "Draft",
  submitted: "Menunggu Review",
  reviewed: "Ditinjau",
  approved: "Disetujui",
  rejected: "Ditolak",
};

const ProposalDetail = () => {
  const { proposal, loading, supervisors, handleUpdateSupervisors } = useProposalData();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewName, setPreviewName] = useState('');
  
  // State for supervisor editing
  const [isEditSupervisorDialogOpen, setIsEditSupervisorDialogOpen] = useState(false);
  
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
      
      toast.success('Proposal berhasil disetujui');
      setIsApproveDialogOpen(false);
    } catch (error: any) {
      console.error("Error approving proposal:", error);
      toast.error(`Failed to approve proposal: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!proposal) return;
    
    if (!rejectionReason.trim()) {
      toast.error('Harap berikan alasan penolakan');
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
      
      toast.success('Proposal berhasil ditolak');
      setIsRejectDialogOpen(false);
    } catch (error: any) {
      console.error("Error rejecting proposal:", error);
      toast.error(`Failed to reject proposal: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewDocument = (url: string, name: string) => {
    setPreviewUrl(url);
    setPreviewName(name);
    setPreviewDialogOpen(true);
  };

  const handleDownloadFile = (url: string, fileName: string) => {
    window.open(url, '_blank');
    toast.success(`Downloading ${fileName}`);
  };

  if (loading) {
    return <ProposalLoading />;
  }

  if (!proposal) {
    return <NotFoundMessage />;
  }

  return (
    <div className="space-y-6">
      <ProposalHeader 
        title="Detail Proposal" 
        status={proposal.status} 
        statusColors={statusColors}
        statusLabels={statusLabels}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Proposal Details */}
        <div className="md:col-span-2">
          <ProposalDetails
            title={proposal.title}
            createdAt={proposal.created_at}
            description={proposal.description}
            companyName={proposal.company_name}
            rejectionReason={proposal.rejectionReason}
            status={proposal.status}
            documents={proposal.documents}
            onPreviewDocument={handlePreviewDocument}
            onDownloadFile={handleDownloadFile}
          />
          
          <ProposalActions 
            status={proposal.status}
            onApprove={() => setIsApproveDialogOpen(true)}
            onReject={() => setIsRejectDialogOpen(true)}
          />
        </div>
        
        {/* Team & Supervisor Info */}
        <TeamInfo 
          team={proposal.team}
          student={proposal.student}
          supervisors={supervisors}
          onEditSupervisor={() => setIsEditSupervisorDialogOpen(true)}
          isCoordinator={true}
        />
      </div>
      
      <ActionDialogs
        isApproveDialogOpen={isApproveDialogOpen}
        setIsApproveDialogOpen={setIsApproveDialogOpen}
        isRejectDialogOpen={isRejectDialogOpen}
        setIsRejectDialogOpen={setIsRejectDialogOpen}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        handleApprove={handleApprove}
        handleReject={handleReject}
        isSubmitting={isSubmitting}
      />

      <DocumentPreview
        isOpen={previewDialogOpen}
        setIsOpen={setPreviewDialogOpen}
        url={previewUrl}
        name={previewName}
        onDownload={handleDownloadFile}
      />
      
      {/* Supervisor Edit Dialog */}
      <SupervisorEditDialog
        isOpen={isEditSupervisorDialogOpen}
        setIsOpen={setIsEditSupervisorDialogOpen}
        proposalId={proposal.id}
        teamId={proposal.team_id}
        currentSupervisors={supervisors}
        onSupervisorsUpdated={handleUpdateSupervisors}
      />
    </div>
  );
};

export default ProposalDetail;
