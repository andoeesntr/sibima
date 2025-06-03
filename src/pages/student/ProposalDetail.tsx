
import { useParams, useNavigate } from 'react-router-dom';
import { useProposalDetail } from '@/hooks/useProposalDetail';
import ProposalHeader from '@/components/student/proposals/ProposalHeader';
import ProposalDetailSkeleton from '@/components/student/proposals/ProposalDetailSkeleton';
import ProposalNotFound from '@/components/student/proposals/ProposalNotFound';
import ProposalDetailContent from '@/components/student/proposals/ProposalDetailContent';
import DocumentPreviewDialog from '@/components/student/proposals/DocumentPreviewDialog';

const ProposalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    proposal,
    loading,
    attachments,
    supervisors,
    previewUrl,
    previewName,
    previewDialogOpen,
    setPreviewDialogOpen,
    handlePreview
  } = useProposalDetail(id);

  if (loading) {
    return <ProposalDetailSkeleton />;
  }

  if (!proposal) {
    return <ProposalNotFound />;
  }

  return (
    <div className="space-y-6">
      <ProposalHeader status={proposal.status} />

      <ProposalDetailContent
        proposal={proposal}
        supervisors={supervisors}
        attachments={attachments}
        onPreview={handlePreview}
      />

      <DocumentPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        previewUrl={previewUrl}
        previewName={previewName}
      />
    </div>
  );
};

export default ProposalDetail;
