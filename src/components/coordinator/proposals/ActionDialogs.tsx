
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ApproveDialog from "./dialogs/ApproveDialog";
import RejectDialog from "./dialogs/RejectDialog";
import RevisionDialog from "./dialogs/RevisionDialog";

interface ActionDialogsProps {
  isApproveDialogOpen: boolean;
  setIsApproveDialogOpen: (isOpen: boolean) => void;
  isRejectDialogOpen: boolean;
  setIsRejectDialogOpen: (isOpen: boolean) => void;
  isRevisionDialogOpen: boolean;
  setIsRevisionDialogOpen: (isOpen: boolean) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  revisionFeedback: string;
  setRevisionFeedback: (feedback: string) => void;
  handleApprove: () => Promise<void>;
  handleReject: () => Promise<void>;
  handleRevision: () => Promise<void>;
  isSubmitting: boolean;
  proposalId: string;
}

const ActionDialogs = ({
  isApproveDialogOpen,
  setIsApproveDialogOpen,
  isRejectDialogOpen,
  setIsRejectDialogOpen,
  isRevisionDialogOpen,
  setIsRevisionDialogOpen,
  proposalId
}: ActionDialogsProps) => {
  return (
    <>
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <ApproveDialog 
            onCancel={() => setIsApproveDialogOpen(false)} 
            onApprove={() => setIsApproveDialogOpen(false)}
            proposalId={proposalId}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <RejectDialog 
            onCancel={() => setIsRejectDialogOpen(false)} 
            onReject={() => setIsRejectDialogOpen(false)}
            proposalId={proposalId}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isRevisionDialogOpen} onOpenChange={setIsRevisionDialogOpen}>
        <DialogContent>
          <RevisionDialog 
            onCancel={() => setIsRevisionDialogOpen(false)} 
            onRevision={() => setIsRevisionDialogOpen(false)}
            proposalId={proposalId}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionDialogs;
