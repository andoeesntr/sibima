
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
}

const ActionDialogs = ({
  isApproveDialogOpen,
  setIsApproveDialogOpen,
  isRejectDialogOpen,
  setIsRejectDialogOpen,
  isRevisionDialogOpen,
  setIsRevisionDialogOpen,
  rejectionReason,
  setRejectionReason,
  revisionFeedback,
  setRevisionFeedback,
  handleApprove,
  handleReject,
  handleRevision,
  isSubmitting
}: ActionDialogsProps) => {
  return (
    <>
      <ApproveDialog
        isOpen={isApproveDialogOpen}
        setIsOpen={setIsApproveDialogOpen}
        handleApprove={handleApprove}
        isSubmitting={isSubmitting}
      />
      
      <RejectDialog
        isOpen={isRejectDialogOpen}
        setIsOpen={setIsRejectDialogOpen}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        handleReject={handleReject}
        isSubmitting={isSubmitting}
      />

      <RevisionDialog
        isOpen={isRevisionDialogOpen}
        setIsOpen={setIsRevisionDialogOpen}
        revisionFeedback={revisionFeedback}
        setRevisionFeedback={setRevisionFeedback}
        handleRevision={handleRevision}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default ActionDialogs;
