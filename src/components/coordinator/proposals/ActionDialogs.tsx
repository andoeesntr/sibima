
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
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
              onClick={() => setIsApproveDialogOpen(false)}
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
      
      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
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
              onClick={() => setIsRejectDialogOpen(false)}
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

      {/* Revision Dialog */}
      <Dialog open={isRevisionDialogOpen} onOpenChange={setIsRevisionDialogOpen}>
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
              onClick={() => setIsRevisionDialogOpen(false)}
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
    </>
  );
};

export default ActionDialogs;
