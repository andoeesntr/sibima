
import { useNavigate } from 'react-router-dom';
import ProposalLoading from '@/components/coordinator/proposals/ProposalLoading';
import NotFoundMessage from '@/components/coordinator/proposals/NotFoundMessage';
import ProposalHeader from '@/components/coordinator/proposals/ProposalHeader';
import ProposalDetails from '@/components/coordinator/proposals/ProposalDetails';
import TeamInfo from '@/components/coordinator/proposals/TeamInfo';
import ActionDialogs from '@/components/coordinator/proposals/ActionDialogs';
import DocumentPreview from '@/components/coordinator/proposals/DocumentPreview';
import ProposalActions from '@/components/coordinator/proposals/ProposalActions';
import { useCoordinatorProposalDetail } from '@/hooks/useCoordinatorProposalDetail';
import { statusColors, statusLabels } from '@/constants/proposalStatus';

const ProposalDetail = () => {
  const {
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
  } = useCoordinatorProposalDetail();

  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate('/coordinator/proposal-list');
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
        onGoBack={handleGoBack}
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
            onRevision={() => setIsRevisionDialogOpen(true)}
          />
        </div>
        
        {/* Team & Supervisor Info */}
        <TeamInfo 
          team={proposal.team}
          student={proposal.student}
          supervisors={supervisors}
          isCoordinator={true}
          proposalId={proposal.id}
          onSupervisorsUpdated={handleUpdateSupervisors}
        />
      </div>
      
      <ActionDialogs
        isApproveDialogOpen={isApproveDialogOpen}
        setIsApproveDialogOpen={setIsApproveDialogOpen}
        isRejectDialogOpen={isRejectDialogOpen}
        setIsRejectDialogOpen={setIsRejectDialogOpen}
        isRevisionDialogOpen={isRevisionDialogOpen}
        setIsRevisionDialogOpen={setIsRevisionDialogOpen}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        revisionFeedback={revisionFeedback}
        setRevisionFeedback={setRevisionFeedback}
        handleApprove={handleApprove}
        handleReject={handleReject}
        handleRevision={handleRevision}
        isSubmitting={isSubmitting}
      />

      <DocumentPreview
        isOpen={previewDialogOpen}
        setIsOpen={setPreviewDialogOpen}
        url={previewUrl}
        name={previewName}
        onDownload={handleDownloadFile}
      />
    </div>
  );
};

export default ProposalDetail;
