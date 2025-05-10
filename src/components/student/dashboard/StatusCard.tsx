
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileWarning } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProposalType } from "@/types/student";

interface StatusCardProps {
  proposals: ProposalType[];
  selectedProposal: ProposalType | null;
  onSelectProposal: (proposal: ProposalType) => void;
  formatDate: (dateString: string) => string;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
}

export const StatusCard = ({
  proposals,
  selectedProposal,
  onSelectProposal,
  formatDate,
  statusColors,
  statusLabels
}: StatusCardProps) => {
  const navigate = useNavigate();
  
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
                  value={selectedProposal?.id} 
                  onValueChange={(value) => {
                    const selected = proposals.find(p => p.id === value);
                    if (selected) onSelectProposal(selected);
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
            
            {selectedProposal && (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Judul KP:</span>
                  <span>{selectedProposal.title}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Status:</span>
                  <Badge className={statusColors[selectedProposal.status as keyof typeof statusColors] || "bg-gray-500"}>
                    {statusLabels[selectedProposal.status as keyof typeof statusLabels] || "Unknown"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Tanggal Pengajuan:</span>
                  <span className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    {formatDate(selectedProposal.created_at || selectedProposal.submissionDate)}
                  </span>
                </div>
                
                {selectedProposal.companyName && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Perusahaan/Instansi:</span>
                    <span>{selectedProposal.companyName}</span>
                  </div>
                )}
                
                {selectedProposal.reviewDate && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Tanggal Review:</span>
                    <span className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      {formatDate(selectedProposal.reviewDate)}
                    </span>
                  </div>
                )}
                
                {selectedProposal.status === 'rejected' && selectedProposal.rejectionReason && (
                  <div>
                    <span className="font-medium text-gray-700 block mb-1">Alasan Penolakan:</span>
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">
                      {selectedProposal.rejectionReason}
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
      
      {selectedProposal && (
        <CardFooter className="flex justify-end">
          <Button 
            className="bg-primary hover:bg-primary/90" 
            onClick={() => navigate(`/student/proposal-detail/${selectedProposal.id}`)}
          >
            {selectedProposal.status === 'rejected' ? 'Lihat Detail Penolakan' : 'Lihat Detail Proposal'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
