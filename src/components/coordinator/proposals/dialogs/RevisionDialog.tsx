
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface RevisionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  revisionFeedback: string;
  setRevisionFeedback: (feedback: string) => void;
  handleRevision: () => Promise<void>;
  isSubmitting: boolean;
}

const RevisionDialog = ({
  isOpen,
  setIsOpen,
  revisionFeedback,
  setRevisionFeedback,
  handleRevision,
  isSubmitting
}: RevisionDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Minta Revisi Proposal</DialogTitle>
          <DialogDescription>
            Berikan catatan untuk revisi proposal ini
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea 
            placeholder="Masukkan catatan revisi" 
            value={revisionFeedback}
            onChange={(e) => setRevisionFeedback(e.target.value)}
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
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={handleRevision}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Memproses...' : 'Kirim Revisi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RevisionDialog;
