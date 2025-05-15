
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface RejectDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  handleReject: () => Promise<void>;
  isSubmitting: boolean;
}

const RejectDialog = ({
  isOpen,
  setIsOpen,
  rejectionReason,
  setRejectionReason,
  handleReject,
  isSubmitting
}: RejectDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tolak Proposal</DialogTitle>
          <DialogDescription>
            Berikan alasan penolakan untuk proposal ini
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea 
            placeholder="Masukkan alasan penolakan" 
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button 
            variant="destructive"
            onClick={handleReject}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Memproses...' : 'Tolak'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectDialog;
