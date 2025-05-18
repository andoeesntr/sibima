
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck } from 'lucide-react';
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
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-center">Pengajuan Proposal</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <FileCheck className="w-12 h-12 mx-auto mb-4 text-primary" />
          <p className="text-sm text-gray-600 mb-4">
            Ajukan proposal kerja praktik Anda atau periksa status pengajuan
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate('/student/proposal-submission')}
          >
            Akses
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-center">Digital Signature</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <FileCheck className="w-12 h-12 mx-auto mb-4 text-secondary" />
          <p className="text-sm text-gray-600 mb-4">
            Download tanda tangan digital dan QR code untuk dokumen KP Anda
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            className="bg-secondary hover:bg-secondary/90"
            onClick={() => navigate('/student/digital-signature')}
            disabled={!selectedProposal || selectedProposal.status !== 'approved'}
          >
            {(!selectedProposal || selectedProposal.status !== 'approved') ? 
              'Belum Tersedia' : 'Akses'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-center">Panduan KP</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <FileCheck className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <p className="text-sm text-gray-600 mb-4">
            Akses panduan dan template dokumen kerja praktik
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant="outline"
            onClick={() => navigate('/student/guide')}
          >
            Akses
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};
