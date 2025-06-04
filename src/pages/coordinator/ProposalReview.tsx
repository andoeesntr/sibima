
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

  // Reset selected proposal when dialogs close
  const handleDialogClose = () => {
    setSelectedProposalId(null);
    refreshProposals();
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
          setIsApproveDialogOpen={(open) => {
            setIsApproveDialogOpen(open);
            if (!open) handleDialogClose();
          }}
          isRejectDialogOpen={isRejectDialogOpen}
          setIsRejectDialogOpen={(open) => {
            setIsRejectDialogOpen(open);
            if (!open) handleDialogClose();
          }}
          isRevisionDialogOpen={isRevisionDialogOpen}
          setIsRevisionDialogOpen={(open) => {
            setIsRevisionDialogOpen(open);
            if (!open) handleDialogClose();
          }}
          proposalId={selectedProposalId}
        />
      )}
    </div>
  );
};

export default ProposalReview;
