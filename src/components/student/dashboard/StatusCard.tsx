
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileWarning } from 'lucide-react';
import { ProposalType } from "@/types/student";
import { Evaluation } from "@/services/evaluationService";
import { formatDate as formatProposalDate } from "@/utils/dateUtils";

// Define status colors and labels
const statusColors: Record<string, string> = {
  submitted: "bg-blue-500",
  revision: "bg-amber-500",
  approved: "bg-green-500",
  rejected: "bg-red-500"
};

const statusLabels: Record<string, string> = {
  submitted: "Menunggu Review",
  revision: "Perlu Revisi",
  approved: "Disetujui",
  rejected: "Ditolak"
};

export interface StatusCardProps {
  proposals: ProposalType[]; // diupdate: sekarang pasti hanya 1 (approved terbaru)
  selectedProposal?: ProposalType | null;
  onSelectProposal?: (proposal: ProposalType) => void;
  evaluations: Evaluation[];
}

export const StatusCard = ({
  proposals,
  selectedProposal,
  onSelectProposal,
  evaluations
}: StatusCardProps) => {
  const navigate = useNavigate();
  // currentProposal pasti hanya 1 yang approved (atau null).
  const currentProposal = proposals.length > 0 ? proposals[0] : null;

  const formatDate = (dateString: string) => {
    return formatProposalDate(dateString);
  };

  // HAPUS TABS, HANYA 1 PROPOSAL
  return (
    <div>
      {currentProposal ? (
        <>
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Judul KP:</span>
            <span>{currentProposal.title}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Status:</span>
            <Badge className={statusColors[currentProposal.status] || "bg-gray-500"}>
              {statusLabels[currentProposal.status] || "Unknown"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Tanggal Pengajuan:</span>
            <span className="flex items-center">
              <Calendar size={16} className="mr-1" />
              {formatDate(currentProposal.created_at || currentProposal.submissionDate)}
            </span>
          </div>
          
          {currentProposal.companyName && (
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Perusahaan/Instansi:</span>
              <span>{currentProposal.companyName}</span>
            </div>
          )}

          {currentProposal.reviewDate && (
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Tanggal Review:</span>
              <span className="flex items-center">
                <Calendar size={16} className="mr-1" />
                {formatDate(currentProposal.reviewDate)}
              </span>
            </div>
          )}

          {currentProposal.status === 'rejected' && currentProposal.rejectionReason && (
            <div>
              <span className="font-medium text-gray-700 block mb-1">Alasan Penolakan:</span>
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">
                {currentProposal.rejectionReason}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-6">
          <FileWarning className="mx-auto mb-3 text-amber-500" size={40} />
          <p className="text-gray-600">Belum ada proposal KP yang disetujui</p>
          <Button 
            className="mt-4 bg-primary hover:bg-primary/90"
            onClick={() => navigate('/student/proposal-submission')}
          >
            Ajukan Proposal
          </Button>
        </div>
      )}
      {/* The detail button is now ONLY managed in Dashboard.tsx below documents, not here */}
    </div>
  );
};

