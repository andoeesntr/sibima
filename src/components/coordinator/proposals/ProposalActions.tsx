
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface ProposalActionsProps {
  status: string;
  onApprove: () => void;
  onReject: () => void;
}

const ProposalActions = ({ status, onApprove, onReject }: ProposalActionsProps) => {
  if (status !== 'submitted') {
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
        className="bg-primary hover:bg-primary/90"
        onClick={onApprove}
      >
        <Check size={16} className="mr-1" /> Setuju
      </Button>
    </CardFooter>
  );
};

export default ProposalActions;
