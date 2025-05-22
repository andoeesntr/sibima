
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search } from 'lucide-react';
import { useProposals, ProposalStatus } from '@/hooks/useProposals';
import ProposalCard from '@/components/coordinator/ProposalCard';
import ActionDialogs from '@/components/coordinator/proposals/ActionDialogs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ProposalReview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProposalStatus>('submitted');
  const [searchQuery, setSearchQuery] = useState('');
  const { proposals, loading, refreshProposals } = useProposals();
  
  // Dialog states
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("All proposals for review:", proposals.map(p => ({ 
    id: p.id,
    title: p.title, 
    status: p.status, 
    rejectionReason: p.rejectionReason 
  })));

  const filteredProposals = proposals.filter(proposal => {
    // Filter by tab selection
    if (activeTab !== 'all') {
      if (activeTab === 'revision') {
        // For "revision" tab, check if status is 'revision' OR 
        // (submitted with rejectionReason which indicates it needs revision)
        return proposal.status === 'revision' || 
               (proposal.status === 'submitted' && proposal.rejectionReason);
      } else {
        // For other tabs, check status normally
        return proposal.status === activeTab;
      }
    }
    
    // Filter by search query
    if (searchQuery) {
      return proposal.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  });

  console.log("Filtered proposals for tab", activeTab, ":", filteredProposals.length);

  const handleViewProposal = (proposalId: string) => {
    navigate(`/coordinator/proposal-detail/${proposalId}`);
  };
  
  // Dialog handlers
  const handleApproveClick = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setIsApproveDialogOpen(true);
  };

  const handleRejectClick = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setIsRejectDialogOpen(true);
  };

  const handleRevisionClick = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setIsRevisionDialogOpen(true);
  };

  // Action handlers
  const handleApprove = async () => {
    if (!selectedProposalId) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProposalId);
        
      if (error) throw error;
      
      toast.success("Proposal berhasil disetujui");
      setIsApproveDialogOpen(false);
      // Refresh the proposal list
      refreshProposals();
    } catch (error: any) {
      console.error("Error approving proposal:", error);
      toast.error(`Failed to approve proposal: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setSelectedProposalId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedProposalId) return;
    
    if (!rejectionReason.trim()) {
      toast.error("Harap berikan alasan penolakan");
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
        .eq('id', selectedProposalId);
        
      if (error) throw error;
      
      toast.success("Proposal berhasil ditolak");
      setIsRejectDialogOpen(false);
      // Refresh the proposal list
      refreshProposals();
    } catch (error: any) {
      console.error("Error rejecting proposal:", error);
      toast.error(`Failed to reject proposal: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setRejectionReason('');
      setSelectedProposalId(null);
    }
  };

  const handleRevision = async () => {
    if (!selectedProposalId) return;
    
    if (!revisionFeedback.trim()) {
      toast.error("Harap berikan catatan revisi");
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
        .eq('id', selectedProposalId);
        
      if (proposalError) throw proposalError;
      
      toast.success("Permintaan revisi berhasil dikirim");
      setIsRevisionDialogOpen(false);
      // Refresh the proposal list
      refreshProposals();
    } catch (error: any) {
      console.error("Error requesting revision:", error);
      toast.error(`Failed to request revision: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setRevisionFeedback('');
      setSelectedProposalId(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Review Proposal KP</h1>
        <div className="relative w-64">
          <Input
            placeholder="Cari proposal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProposalStatus)}>
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="submitted">Menunggu Review</TabsTrigger>
          <TabsTrigger value="revision">Perlu Revisi</TabsTrigger>
          <TabsTrigger value="approved">Disetujui</TabsTrigger>
          <TabsTrigger value="rejected">Ditolak</TabsTrigger>
          <TabsTrigger value="all">Semua</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredProposals.length > 0 ? (
            filteredProposals.map((proposal) => (
              <ProposalCard 
                key={proposal.id}
                proposal={proposal}
                onView={handleViewProposal}
                onApprove={proposal.status === 'submitted' ? () => handleApproveClick(proposal.id) : undefined}
                onReject={proposal.status === 'submitted' ? () => handleRejectClick(proposal.id) : undefined}
                onRevision={proposal.status === 'submitted' ? () => handleRevisionClick(proposal.id) : undefined}
              />
            ))
          ) : (
            <div className="text-center py-10">
              <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Tidak ada proposal</h3>
              <p className="text-gray-500">
                {searchQuery ? 
                  'Tidak ada proposal yang sesuai dengan pencarian Anda' : 
                  'Belum ada proposal yang perlu ditinjau'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialogs */}
      {selectedProposalId && (
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
          proposalId={selectedProposalId}
        />
      )}
    </div>
  );
};

export default ProposalReview;
