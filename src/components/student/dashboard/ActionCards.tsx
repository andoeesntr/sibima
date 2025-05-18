
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileSignature, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProposalType } from "@/types/student";

export interface ActionCardsProps {
  hasActiveProposal: boolean;
  onSubmitProposal: () => void;
  selectedProposal?: ProposalType | null;
}

export const ActionCards = ({ hasActiveProposal, onSubmitProposal, selectedProposal }: ActionCardsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <FileText className="w-8 h-8 mb-2 text-primary" />
          <span className="text-sm font-medium mb-2">Pengajuan Proposal</span>
          <Button 
            className="w-full bg-primary hover:bg-primary/90"
            onClick={() => navigate('/student/proposal-submission')}
            size="sm"
          >
            Akses
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <FileSignature className="w-8 h-8 mb-2 text-secondary" />
          <span className="text-sm font-medium mb-2">Digital Signature</span>
          <Button 
            className="w-full bg-secondary hover:bg-secondary/90"
            onClick={() => navigate('/student/digital-signature')}
            disabled={!selectedProposal || selectedProposal.status !== 'approved'}
            size="sm"
          >
            {(!selectedProposal || selectedProposal.status !== 'approved') ? 
              'Belum Tersedia' : 'Akses'}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <BookOpen className="w-8 h-8 mb-2 text-blue-500" />
          <span className="text-sm font-medium mb-2">Panduan KP</span>
          <Button 
            variant="outline"
            onClick={() => navigate('/student/guide')}
            size="sm"
            className="w-full"
          >
            Akses
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
