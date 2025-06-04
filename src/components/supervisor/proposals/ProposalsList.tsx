
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProposalListItem from './components/ProposalListItem';
import ProposalsLoading from './components/ProposalsLoading';
import ProposalsEmpty from './components/ProposalsEmpty';

// Create a generic type that works with different proposal structures
interface CommonProposal {
  id: string;
  title: string;
  submissionDate: string;
  status: string;
  studentName?: string;
  supervisorIds: string[]; // Required to match other interfaces
  description: string;     // Changed from optional to required
  created_at?: string;     // Add created_at for sorting
}

interface ProposalsListProps {
  proposals: CommonProposal[]; 
  loading: boolean;
  selectedProposal: CommonProposal | null; 
  onSelectProposal: (proposal: CommonProposal) => void;
  formatDate?: (dateString: string) => string;
}

const ProposalsList = ({ 
  proposals, 
  loading, 
  selectedProposal, 
  onSelectProposal,
  formatDate = (date) => date
}: ProposalsListProps) => {
  const selectedId = typeof selectedProposal === 'string' 
    ? selectedProposal 
    : selectedProposal?.id;
  
  // Sort proposals by submissionDate in descending order (newest first)
  const sortedProposals = [...proposals].sort((a, b) => {
    const dateA = a.submissionDate || a.created_at || '';
    const dateB = b.submissionDate || b.created_at || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
  
  return (
    <Card className="md:col-span-1">
      <CardHeader>
        <CardTitle>Daftar Proposal</CardTitle>
        <CardDescription>
          Proposal mahasiswa yang Anda bimbing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ProposalsLoading />
        ) : (
          <div className="space-y-3">
            {sortedProposals.length > 0 ? (
              sortedProposals.map(proposal => (
                <ProposalListItem 
                  key={proposal.id}
                  proposal={proposal}
                  isSelected={selectedId === proposal.id}
                  formatDate={formatDate}
                  onClick={() => onSelectProposal(proposal)}
                />
              ))
            ) : (
              <ProposalsEmpty />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProposalsList;
