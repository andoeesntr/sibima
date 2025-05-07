
import { Badge } from "@/components/ui/badge";
import { Proposal } from '@/hooks/useProposals';
import { statusColors, statusLabels } from '@/utils/proposalConstants';

interface ProposalListItemProps {
  proposal: Proposal;
  isSelected: boolean;
  formatDate: (dateString: string) => string;
  onClick: () => void;
}

const ProposalListItem = ({
  proposal,
  isSelected,
  formatDate,
  onClick
}: ProposalListItemProps) => {
  return (
    <div 
      className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-primary/5 border-primary' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="font-medium truncate">{proposal.title}</div>
        <Badge className={statusColors[proposal.status as keyof typeof statusColors]}>
          {statusLabels[proposal.status as keyof typeof statusLabels] || proposal.status}
        </Badge>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {formatDate(proposal.submissionDate)}
      </div>
      <div className="text-xs text-gray-500">
        Mahasiswa: {proposal.studentName || 'Unknown'}
      </div>
    </div>
  );
};

export default ProposalListItem;
