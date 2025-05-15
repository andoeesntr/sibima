
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ApproveDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleApprove: () => Promise<void>;
  isSubmitting: boolean;
}

const ApproveDialog = ({
  isOpen,
  setIsOpen,
  handleApprove,
  isSubmitting
}: ApproveDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Setujui Proposal</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menyetujui proposal ini?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Memproses...' : 'Setujui'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApproveDialog;
