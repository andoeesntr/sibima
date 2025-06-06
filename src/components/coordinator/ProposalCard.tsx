
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, FileText, X, FileEdit } from "lucide-react";
import { Proposal } from '@/hooks/useProposals';

interface ProposalCardProps {
  proposal: Proposal;
  onView: (proposalId: string) => void;
  onApprove?: (proposalId: string) => void;
  onReject?: (proposalId: string) => void;
  onRevision?: (proposalId: string) => void;
}

const statusColors: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  revision: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800"
};

const statusLabels: Record<string, string> = {
  submitted: "Menunggu Review",
  revision: "Perlu Revisi",
  approved: "Disetujui",
  rejected: "Ditolak"
};

const ProposalCard = ({ proposal, onView, onApprove, onReject, onRevision }: ProposalCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };

  const showActions = proposal.status === 'submitted' && onApprove && onReject && onRevision;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between mb-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{proposal.title}</h3>
            <p className="text-sm text-gray-500">
              Diajukan: {formatDate(proposal.submissionDate)}
            </p>
          </div>
          <Badge className={statusColors[proposal.status]}>
            {statusLabels[proposal.status]}
          </Badge>
        </div>
        
        <p className="text-gray-700 my-2 line-clamp-2">
          {proposal.description || "Tidak ada deskripsi"}
        </p>
        
        {proposal.rejectionReason && proposal.status !== 'approved' && (
          <div className="mt-3 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-800">
              <span className="font-medium">Catatan: </span>
              {proposal.rejectionReason}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-6 py-3 flex justify-between">
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-1 text-gray-500" />
          <span className="text-sm text-gray-500">
            Mahasiswa: {proposal.studentName || '-'}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView(proposal.id)}
          >
            Detail
          </Button>
          
          {showActions && (
            <>
              <Button 
                variant="reject"
                size="sm"
                onClick={() => onReject(proposal.id)}
              >
                <X size={16} className="mr-1" /> Tolak
              </Button>
              <Button 
                variant="revision"
                size="sm"
                onClick={() => onRevision(proposal.id)}
              >
                <FileEdit size={16} className="mr-1" /> Revisi
              </Button>
              <Button 
                size="sm"
                className="bg-primary hover:bg-primary/90"
                onClick={() => onApprove(proposal.id)}
              >
                <Check size={16} className="mr-1" /> Setuju
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProposalCard;
