
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import { syncProposalStatusWithTeam } from '@/services/proposalService';

interface ApproveDialogProps {
  onCancel: () => void;
  onApprove: () => void;
  proposalId: string;
}

const ApproveDialog = ({ onCancel, onApprove, proposalId }: ApproveDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      console.log('Starting proposal approval process for:', proposalId);
      
      // Use the improved sync function that avoids ON CONFLICT issues
      await syncProposalStatusWithTeam(proposalId, 'approved');
      
      console.log('Proposal approval completed successfully');
      toast.success("Proposal berhasil disetujui");
      onApprove();
    } catch (error: any) {
      console.error('Error approving proposal:', error);
      const errorMessage = error.message || 'Terjadi kesalahan saat menyetujui proposal';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>Setujui Proposal</DialogTitle>
        <DialogDescription>
          Apakah Anda yakin ingin menyetujui proposal ini? Status proposal akan berubah menjadi disetujui.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center my-4 p-4 bg-green-50 rounded-md border border-green-100">
        <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
        <p className="text-center text-gray-600">
          Dengan menyetujui proposal ini, mahasiswa dapat melanjutkan ke tahap selanjutnya dari Kerja Praktik.
        </p>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button 
          className="bg-primary hover:bg-primary/90"
          disabled={isSubmitting}
          onClick={handleApprove}
        >
          {isSubmitting ? "Memproses..." : "Setuju"}
        </Button>
      </div>
    </>
  );
};

export default ApproveDialog;
