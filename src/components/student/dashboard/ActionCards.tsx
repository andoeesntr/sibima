
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, FileText, FileSignature, BookOpen } from 'lucide-react';
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-center">Pengajuan Proposal</CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-2">
          <FileText className="w-10 h-10 mx-auto mb-2 text-primary" />
        </CardContent>
        <CardFooter className="flex justify-center pt-0">
          <Button 
            className="bg-primary hover:bg-primary/90 w-full"
            onClick={() => navigate('/student/proposal-submission')}
            size="sm"
          >
            Akses
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-center">Digital Signature</CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-2">
          <FileSignature className="w-10 h-10 mx-auto mb-2 text-secondary" />
        </CardContent>
        <CardFooter className="flex justify-center pt-0">
          <Button 
            className="bg-secondary hover:bg-secondary/90 w-full"
            onClick={() => navigate('/student/digital-signature')}
            disabled={!selectedProposal || selectedProposal.status !== 'approved'}
            size="sm"
          >
            {(!selectedProposal || selectedProposal.status !== 'approved') ? 
              'Belum Tersedia' : 'Akses'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-center">Panduan KP</CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-2">
          <BookOpen className="w-10 h-10 mx-auto mb-2 text-blue-500" />
        </CardContent>
        <CardFooter className="flex justify-center pt-0">
          <Button 
            variant="outline"
            onClick={() => navigate('/student/guide')}
            size="sm"
            className="w-full"
          >
            Akses
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
