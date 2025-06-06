
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, FileEdit, X, Share2 } from "lucide-react";

interface ProposalActionsProps {
  status: string;
  onApprove: () => void;
  onReject: () => void;
  onRevision?: () => void;
  onShare?: () => void;
}

const ProposalActions = ({ status, onApprove, onReject, onRevision, onShare }: ProposalActionsProps) => {
  // Show actions for submitted proposals or proposals that need revision/review
  if (status !== 'submitted' && status !== 'revision') {
    return null;
  }
  
  return (
    <CardFooter className="flex justify-end space-x-4">
      <Button 
        variant="reject"
        onClick={onReject}
      >
        <X size={16} className="mr-1" /> Tolak
      </Button>
      <Button 
        variant="revision"
        onClick={onRevision}
      >
        <FileEdit size={16} className="mr-1" /> Revisi
      </Button>
      <Button 
        variant="outline"
        className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-green-700 hover:text-blue-300 hover:border-green-700"
        onClick={onShare}
      >
        <Share2 size={16} className="mr-1" /> Bagikan ke Dosen
      </Button>
      <Button 
        className="bg-primary hover:bg-primary/90"
        onClick={onApprove}
      >
        <Check size={16} className="mr-1" /> Setuju
      </Button>
    </CardFooter>
  );
};

export default ProposalActions;
