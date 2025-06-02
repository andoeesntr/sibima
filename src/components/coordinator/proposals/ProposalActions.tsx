
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, FileEdit, X } from "lucide-react";

interface ProposalActionsProps {
  status: string;
  onApprove: () => void;
  onReject: () => void;
  onRevision?: () => void;
}

const ProposalActions = ({ status, onApprove, onReject, onRevision }: ProposalActionsProps) => {
  // Show actions for submitted proposals or proposals that need revision/review
  if (status !== 'submitted' && status !== 'revision') {
    return null;
  }
  
  return (
    <CardFooter className="flex justify-end space-x-4">
      <Button 
        variant="outline"
        onClick={onReject}
      >
        <X size={16} className="mr-1" /> Tolak
      </Button>
      <Button 
        variant="outline"
        className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800"
        onClick={onRevision}
      >
        <FileEdit size={16} className="mr-1" /> Revisi
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
