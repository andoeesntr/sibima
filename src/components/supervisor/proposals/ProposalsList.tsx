
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Proposal } from '@/hooks/useProposals';
import ProposalListItem from './components/ProposalListItem';
import ProposalsLoading from './components/ProposalsLoading';
import ProposalsEmpty from './components/ProposalsEmpty';

interface ProposalsListProps {
  proposals: Proposal[];
  loading: boolean;
  selectedProposal: Proposal | null;
  onSelectProposal: (proposal: Proposal) => void;
  formatDate: (dateString: string) => string;
}

const ProposalsList = ({ 
  proposals, 
  loading, 
  selectedProposal, 
  onSelectProposal,
  formatDate
}: ProposalsListProps) => {
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
            {proposals.length > 0 ? (
              proposals.map(proposal => (
                <ProposalListItem 
                  key={proposal.id}
                  proposal={proposal}
                  isSelected={selectedProposal?.id === proposal.id}
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
