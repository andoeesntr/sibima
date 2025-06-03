
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { XCircle } from 'lucide-react';
import { ProposalApprovalService } from '@/services/proposalApprovalService';

interface RejectDialogProps {
  onCancel: () => void;
  onReject: () => void;
  proposalId: string;
}

const RejectDialog = ({ onCancel, onReject, proposalId }: RejectDialogProps) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Harap berikan alasan penolakan");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('🚫 Starting proposal rejection process for:', proposalId);
      
      const result = await ProposalApprovalService.rejectProposal(proposalId, rejectionReason);
      
      if (result.success) {
        console.log('✅ Proposal rejection completed successfully');
        toast.success(result.message);
        onReject();
      } else {
        console.error('❌ Proposal rejection failed:', result.message);
        toast.error(result.message);
        
        if (result.errors) {
          result.errors.forEach(error => {
            console.error('📋 Error detail:', error);
          });
        }
      }
    } catch (error: any) {
      console.error('💥 Unexpected error during rejection:', error);
      const errorMessage = error.message || 'Terjadi kesalahan tidak terduga saat menolak proposal';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>Tolak Proposal</DialogTitle>
        <DialogDescription>
          Berikan alasan mengapa proposal ini ditolak. Mahasiswa akan menerima notifikasi beserta alasan penolakan.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center my-4 p-4 bg-red-50 rounded-md border border-red-100">
        <XCircle className="h-12 w-12 text-red-500 mb-2" />
        <p className="text-center text-gray-600">
          Proposal yang ditolak dapat direvisi dan diajukan kembali oleh mahasiswa.
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="rejection-reason" className="block text-sm font-medium mb-2">
            Alasan Penolakan *
          </label>
          <Textarea
            id="rejection-reason"
            placeholder="Masukkan alasan mengapa proposal ini ditolak..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button 
            variant="destructive"
            disabled={isSubmitting || !rejectionReason.trim()}
            onClick={handleReject}
          >
            {isSubmitting ? "Memproses..." : "Tolak Proposal"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default RejectDialog;
