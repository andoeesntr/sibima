
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, FileEdit, FileText, User, X } from 'lucide-react';
import { formatDate } from '@/services/mockData';
import { Proposal } from '@/hooks/useProposals';

const statusColors = {
  draft: "bg-gray-500",
  submitted: "bg-yellow-500",
  revision: "bg-amber-500",
  reviewed: "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
};

const statusLabels = {
  draft: "Draft",
  submitted: "Diajukan",
  revision: "Perlu Revisi",
  reviewed: "Ditinjau",
  approved: "Disetujui",
  rejected: "Ditolak",
};

type ProposalCardProps = {
  proposal: Proposal;
  onView: (proposalId: string) => void;
};

const ProposalCard = ({ proposal, onView }: ProposalCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{proposal.title}</CardTitle>
        <Badge className={statusColors[proposal.status as keyof typeof statusColors]}>
          {statusLabels[proposal.status as keyof typeof statusLabels] || proposal.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600 mb-4">
          {proposal.description.substring(0, 100)}
          {proposal.description.length > 100 ? '...' : ''}
        </div>
        
        {/* Show rejection reason or revision feedback */}
        {(proposal.status === 'rejected' || proposal.status === 'revision') && proposal.rejectionReason && (
          <div className={`${proposal.status === 'rejected' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'} border rounded p-2 mb-4`}>
            <p className={`text-xs font-medium ${proposal.status === 'rejected' ? 'text-red-800' : 'text-amber-800'}`}>
              {proposal.status === 'rejected' ? 'Alasan ditolak: ' : 'Catatan revisi: '}
              {proposal.rejectionReason.substring(0, 70)}
              {proposal.rejectionReason.length > 70 ? '...' : ''}
            </p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <User size={14} className="mr-1" />
            <span>{proposal.supervisorIds.length} Pembimbing</span>
          </div>
          {proposal.studentName && (
            <div>
              Student: {proposal.studentName}
            </div>
          )}
          <div>
            Submitted: {formatDate(proposal.submissionDate)}
          </div>
          {proposal.reviewDate && (
            <div>
              Reviewed: {formatDate(proposal.reviewDate)}
            </div>
          )}
          <div className="flex items-center text-gray-500">
            <FileText size={14} className="mr-1" />
            <span>{proposal.documents && proposal.documents.length > 0 
              ? `${proposal.documents.length} dokumen` 
              : 'Tidak ada dokumen'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {proposal.status === 'submitted' && (
          <>
            <Button 
              onClick={() => onView(proposal.id)}
              className="bg-primary hover:bg-primary/90 flex-1 mr-2"
            >
              <Check size={16} className="mr-1" /> Setuju
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onView(proposal.id)}
              className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800 flex-1 mr-2"
            >
              <FileEdit size={16} className="mr-1" /> Revisi
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => onView(proposal.id)}
              className="flex-1"
            >
              <X size={16} className="mr-1" /> Tolak
            </Button>
          </>
        )}
        {(proposal.status === 'approved' || proposal.status === 'rejected' || proposal.status === 'revision') && (
          <Button 
            variant="outline" 
            onClick={() => onView(proposal.id)}
            className="w-full"
          >
            <ArrowRight size={16} className="mr-1" /> Lihat Detail
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProposalCard;
