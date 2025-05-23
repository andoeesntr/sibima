
import { useState } from 'react';
import { Proposal } from '@/types/supervisorProposals';
import { ProposalStatus } from '@/types/proposals';
import { formatDate as formatDateUtil } from '@/utils/proposalConstants';

export const useProposalFilters = () => {
  const [activeTab, setActiveTab] = useState('detail');
  const [activeStatus, setActiveStatus] = useState<ProposalStatus>('all');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  
  // Filter proposals by status
  const filterProposals = (proposals: Proposal[], status: string): Proposal[] => {
    if (status === 'all') return proposals;
    return proposals.filter(p => p.status === status);
  };
  
  // Handle status tab change
  const handleStatusChange = (status: string) => {
    setActiveStatus(status as ProposalStatus);
  };

  // Select a proposal by ID
  const selectProposal = (id: string, proposals: Proposal[]) => {
    const proposal = proposals.find(p => p.id === id);
    setSelectedProposal(proposal || null);
    setActiveTab('detail');
  };
  
  // Handle proposal selection
  const handleSelectProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setActiveTab('detail');
  };

  return {
    activeTab,
    setActiveTab,
    activeStatus,
    handleStatusChange,
    selectedProposal,
    setSelectedProposal,
    filterProposals,
    selectProposal,
    handleSelectProposal,
    formatDate: formatDateUtil
  };
};
