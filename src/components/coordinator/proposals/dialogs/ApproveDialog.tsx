
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import { ProposalApprovalService } from '@/services/proposalApprovalService';

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
      console.log('🚀 Starting proposal approval process for:', proposalId);
      
      const result = await ProposalApprovalService.approveProposal(proposalId);
      
      if (result.success) {
        console.log('✅ Proposal approval completed successfully');
        toast.success(result.message);
        onApprove();
      } else {
        console.error('❌ Proposal approval failed:', result.message);
        toast.error(result.message);
        
        // Log detailed errors if available
        if (result.errors) {
          result.errors.forEach(error => {
            console.error('📋 Error detail:', error);
          });
        }
      }
    } catch (error: any) {
      console.error('💥 Unexpected error during approval:', error);
      const errorMessage = error.message || 'Terjadi kesalahan tidak terduga saat menyetujui proposal';
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
