
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileCheck } from "lucide-react";

interface ProposalFooterProps {
  status: string;
}

const ProposalFooter = ({ status }: ProposalFooterProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between">
      <div>
        {status === 'approved' && (
          <Button 
            onClick={() => navigate('/student/digital-signature')}
            className="bg-secondary hover:bg-secondary/90"
          >
            <FileCheck className="mr-2 h-4 w-4" /> Akses Digital Signature
          </Button>
        )}
      </div>
      {status === 'rejected' && (
        <Button onClick={() => navigate('/student/proposal-submission')}>
          Ajukan Ulang Proposal
        </Button>
      )}
    </div>
  );
};

export default ProposalFooter;
