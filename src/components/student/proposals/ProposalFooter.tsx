
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileCheck, FileEdit } from "lucide-react";

interface ProposalFooterProps {
  status: string;
  proposalId?: string;
  rejectionReason?: string | null;
}

const ProposalFooter = ({ status, proposalId, rejectionReason }: ProposalFooterProps) => {
  const navigate = useNavigate();
  
  // Check if status is revision or if it's submitted with rejection reason
  const needsRevision = status === 'revision' || (status === 'submitted' && rejectionReason);
  
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
        <Button 
          onClick={() => navigate('/student/proposal-submission')}
        >
          <FileEdit className="mr-2 h-4 w-4" />
          Ajukan Ulang Proposal
        </Button>
      )}
      {needsRevision && (
        <Button 
          onClick={() => navigate(`/student/proposal-submission?edit=${proposalId}`)}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          <FileEdit className="mr-2 h-4 w-4" />
          Revisi Proposal
        </Button>
      )}
    </div>
  );
};

export default ProposalFooter;
