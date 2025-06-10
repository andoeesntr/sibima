
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileWarning } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  proposals: ProposalType[];
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
  const currentProposal = selectedProposal || (proposals.length > 0 ? proposals[0] : null);
  
  const handleSelectProposal = (proposal: ProposalType) => {
    if (onSelectProposal) {
      onSelectProposal(proposal);
    }
  };
  
  const formatDate = (dateString: string) => {
    return formatProposalDate(dateString);
  };
  
  return (
    <Card className="col-span-2 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Status KP</CardTitle>
        <CardDescription>Informasi tentang status KP Anda saat ini</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {proposals.length > 0 ? (
          <>
            {proposals.length > 1 && (
              <div className="mb-4">
                <Tabs 
                  value={currentProposal?.id} 
                  onValueChange={(value) => {
                    const selected = proposals.find(p => p.id === value);
                    if (selected) handleSelectProposal(selected);
                  }}
                >
                  <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${Math.min(proposals.length, 3)}, 1fr)` }}>
                    {proposals.slice(0, 3).map((proposal, index) => (
                      <TabsTrigger key={proposal.id} value={proposal.id}>
                        Proposal {index + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            )}
            
            {currentProposal && (
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
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <FileWarning className="mx-auto mb-3 text-amber-500" size={40} />
            <p className="text-gray-600">Anda belum mengajukan proposal KP</p>
            <Button 
              className="mt-4 bg-primary hover:bg-primary/90"
              onClick={() => navigate('/student/proposal-submission')}
            >
              Ajukan Proposal
            </Button>
          </div>
        )}
      </CardContent>
      
      {currentProposal && (
        <CardFooter className="flex justify-end">
          <Button 
            className="bg-primary hover:bg-primary/90" 
            onClick={() => navigate(`/student/proposal-detail/${currentProposal.id}`)}
          >
            {currentProposal.status === 'rejected' ? 'Lihat Detail Penolakan' : 'Lihat Detail Proposal'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
