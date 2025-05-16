
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import ProposalsList from '@/components/supervisor/proposals/ProposalsList';
import FeedbackDialog from '@/components/supervisor/proposals/FeedbackDialog';
import DocumentPreview from '@/components/coordinator/proposals/DocumentPreview';
import KpTimeline from '@/components/coordinator/KpTimeline';
import { useSupervisorProposals } from '@/hooks/useSupervisorProposals';
import ProposalDetailCard from '@/components/supervisor/proposals/ProposalDetailCard';

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewName, setPreviewName] = useState('');
  
  const {
    selectedProposal,
    setSelectedProposal,
    proposals,
    loading,
    activeTab,
    setActiveTab,
    formatDate,
    feedbackContent,
    setFeedbackContent,
    isSubmittingFeedback,
    submitFeedback,
    filterProposals,
    handleStatusChange
  } = useSupervisorProposals();
  
  const handlePreviewFile = (url: string, name: string = '') => {
    setPreviewUrl(url);
    setPreviewName(name);
    setPreviewDialogOpen(true);
  };
  
  const handleDownloadFile = (url: string, fileName: string) => {
    window.open(url, '_blank');
  };
  
  const openFeedbackDialog = () => {
    setIsFeedbackDialogOpen(true);
  };

  const filteredProposals = filterProposals(proposals, activeStatus);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard Dosen Pembimbing</h1>
      
      {/* Timeline at the top */}
      <div className="mb-6">
        <KpTimeline readOnly={true} />
      </div>
      
      <Tabs value={activeStatus} onValueChange={handleStatusChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="submitted">Baru Masuk</TabsTrigger>
          <TabsTrigger value="revision">Perlu Revisi</TabsTrigger>
          <TabsTrigger value="approved">Disetujui</TabsTrigger>
          <TabsTrigger value="rejected">Ditolak</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProposalsList
              proposals={filteredProposals}
              loading={loading}
              selectedProposal={selectedProposal?.id || ''}
              onSelectProposal={setSelectedProposal}
            />
            
            <ProposalDetailCard
              proposal={selectedProposal}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              formatDate={formatDate}
              handlePreviewFile={handlePreviewFile}
              handleDownloadFile={handleDownloadFile}
              onFeedbackClick={openFeedbackDialog}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="submitted" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProposalsList
              proposals={filterProposals(proposals, 'submitted')}
              loading={loading}
              selectedProposal={selectedProposal?.id || ''}
              onSelectProposal={setSelectedProposal}
            />
            
            <ProposalDetailCard
              proposal={selectedProposal}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              formatDate={formatDate}
              handlePreviewFile={handlePreviewFile}
              handleDownloadFile={handleDownloadFile}
              onFeedbackClick={openFeedbackDialog}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="revision" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProposalsList
              proposals={filterProposals(proposals, 'revision')}
              loading={loading}
              selectedProposal={selectedProposal?.id || ''}
              onSelectProposal={setSelectedProposal}
            />
            
            <ProposalDetailCard
              proposal={selectedProposal}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              formatDate={formatDate}
              handlePreviewFile={handlePreviewFile}
              handleDownloadFile={handleDownloadFile}
              onFeedbackClick={openFeedbackDialog}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProposalsList
              proposals={filterProposals(proposals, 'approved')}
              loading={loading}
              selectedProposal={selectedProposal?.id || ''}
              onSelectProposal={setSelectedProposal}
            />
            
            <ProposalDetailCard
              proposal={selectedProposal}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              formatDate={formatDate}
              handlePreviewFile={handlePreviewFile}
              handleDownloadFile={handleDownloadFile}
              onFeedbackClick={openFeedbackDialog}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProposalsList
              proposals={filterProposals(proposals, 'rejected')}
              loading={loading}
              selectedProposal={selectedProposal?.id || ''}
              onSelectProposal={setSelectedProposal}
            />
            
            <ProposalDetailCard
              proposal={selectedProposal}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              formatDate={formatDate}
              handlePreviewFile={handlePreviewFile}
              handleDownloadFile={handleDownloadFile}
              onFeedbackClick={openFeedbackDialog}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <FeedbackDialog
        isOpen={isFeedbackDialogOpen}
        onOpenChange={setIsFeedbackDialogOpen}
        proposalId={selectedProposal?.id || ''}
        content={feedbackContent}
        setContent={setFeedbackContent}
        isSubmitting={isSubmittingFeedback}
        onSubmit={submitFeedback}
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

export default SupervisorDashboard;
