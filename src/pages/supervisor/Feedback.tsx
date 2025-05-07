
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useSupervisorProposals } from '@/hooks/useSupervisorProposals';
import ProposalsList from '@/components/supervisor/proposals/ProposalsList';
import ProposalDetailCard from '@/components/supervisor/proposals/ProposalDetailCard';
import FeedbackDialog from '@/components/supervisor/proposals/FeedbackDialog';
import { formatDate } from '@/utils/proposalConstants';

const SupervisorFeedback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get('id');
  
  const {
    proposals,
    proposalsLoading,
    selectedProposal,
    setSelectedProposal,
    handleSelectProposal,
    handleSendFeedback
  } = useSupervisorProposals();
  
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('detail');
  
  useEffect(() => {
    if (proposalId && proposals.length > 0) {
      const selected = proposals.find(p => p.id === proposalId);
      if (selected) {
        setSelectedProposal(selected);
      }
    }
  }, [proposalId, proposals, setSelectedProposal]);

  const handlePreviewFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const handleDownloadFile = (url: string, fileName: string) => {
    window.open(url, '_blank');
    toast.success(`Downloading ${fileName}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => navigate('/supervisor')}
            variant="outline"
            size="icon"
          >
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-2xl font-bold">Feedback Proposal KP</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Proposals List */}
        <ProposalsList 
          proposals={proposals}
          loading={proposalsLoading}
          selectedProposal={selectedProposal}
          onSelectProposal={handleSelectProposal}
          formatDate={formatDate}
        />

        {/* Selected Proposal Detail */}
        <ProposalDetailCard
          proposal={selectedProposal}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          formatDate={formatDate}
          handlePreviewFile={handlePreviewFile}
          handleDownloadFile={handleDownloadFile}
          onFeedbackClick={() => setIsFeedbackDialogOpen(true)}
        />
      </div>
      
      {/* Feedback Dialog */}
      <FeedbackDialog
        isOpen={isFeedbackDialogOpen}
        onOpenChange={setIsFeedbackDialogOpen}
        onSendFeedback={handleSendFeedback}
        proposalTitle={selectedProposal?.title}
      />
    </div>
  );
};

export default SupervisorFeedback;
