
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Proposal } from '@/hooks/useProposals';

const statusColors = {
  draft: "bg-gray-500",
  submitted: "bg-yellow-500",
  reviewed: "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
};

const statusLabels = {
  draft: "Draft",
  submitted: "Diajukan",
  reviewed: "Ditinjau",
  approved: "Disetujui",
  rejected: "Ditolak",
};

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
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.length > 0 ? (
              proposals.map(proposal => (
                <div 
                  key={proposal.id}
                  className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedProposal?.id === proposal.id ? 'bg-primary/5 border-primary' : ''
                  }`}
                  onClick={() => onSelectProposal(proposal)}
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
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Belum ada proposal yang Anda bimbing</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProposalsList;
