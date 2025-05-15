
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileCheck, FileEdit } from "lucide-react";

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
      {(status === 'rejected' || status === 'revision') && (
        <Button 
          onClick={() => navigate('/student/proposal-submission')}
          className={status === 'revision' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
        >
          <FileEdit className="mr-2 h-4 w-4" />
          {status === 'revision' ? 'Revisi Proposal' : 'Ajukan Ulang Proposal'}
        </Button>
      )}
    </div>
  );
};

export default ProposalFooter;
