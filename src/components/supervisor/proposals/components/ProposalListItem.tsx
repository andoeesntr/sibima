
import { Badge } from "@/components/ui/badge";
import { statusColors, statusLabels } from '@/utils/proposalConstants';

// Use a more generic type that matches CommonProposal from ProposalsList
interface ProposalItem {
  id: string;
  title: string;
  submissionDate: string;
  status: string;
  studentName?: string;
  [key: string]: any; // Allow for other properties
}

interface ProposalListItemProps {
  proposal: ProposalItem;
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
