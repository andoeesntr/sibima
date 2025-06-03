
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useSupervisorProposals } from '@/hooks/useSupervisorProposals';
import ProposalsList from '@/components/supervisor/proposals/ProposalsList';
import ProposalDetailCard from '@/components/supervisor/proposals/ProposalDetailCard';
import FeedbackDialog from '@/components/supervisor/proposals/FeedbackDialog';

const SupervisorFeedback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get('id');
  
  const {
    proposals,
    loading: proposalsLoading,
    selectedProposal,
    setSelectedProposal,
    handleSelectProposal,
    handleSendFeedback,
    formatDate
  } = useSupervisorProposals();
  
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('detail');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
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

  const handleFeedbackSaved = () => {
    // Trigger a refresh to reload feedback
    setRefreshTrigger(prev => prev + 1);
    // Switch to feedback tab to show the new feedback
    setActiveTab('feedback');
  };

  return (
    <div className="space-y-6" key={refreshTrigger}>
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
          onFeedbackSaved={handleFeedbackSaved}
        />
      </div>
      
      {/* Feedback Dialog */}
      <FeedbackDialog
        isOpen={isFeedbackDialogOpen}
        setIsOpen={setIsFeedbackDialogOpen}
        onOpenChange={setIsFeedbackDialogOpen}
        onSendFeedback={async (feedback: string) => {
          const success = await handleSendFeedback(feedback);
          if (success) {
            handleFeedbackSaved();
          }
          return success;
        }}
        proposalTitle={selectedProposal?.title}
      />
    </div>
  );
};

export default SupervisorFeedback;
