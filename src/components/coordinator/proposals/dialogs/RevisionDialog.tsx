
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { FileEdit } from 'lucide-react';
import { ProposalApprovalService } from '@/services/proposalApprovalService';

interface RevisionDialogProps {
  onCancel: () => void;
  onRevision: () => void;
  proposalId: string;
}

const RevisionDialog = ({ onCancel, onRevision, proposalId }: RevisionDialogProps) => {
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRevision = async () => {
    if (!revisionFeedback.trim()) {
      toast.error("Harap berikan catatan revisi");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('📝 Starting revision request process for:', proposalId);
      
      const result = await ProposalApprovalService.requestRevision(proposalId, revisionFeedback);
      
      if (result.success) {
        console.log('✅ Revision request completed successfully');
        toast.success(result.message);
        onRevision();
      } else {
        console.error('❌ Revision request failed:', result.message);
        toast.error(result.message);
        
        if (result.errors) {
          result.errors.forEach(error => {
            console.error('📋 Error detail:', error);
          });
        }
      }
    } catch (error: any) {
      console.error('💥 Unexpected error during revision request:', error);
      const errorMessage = error.message || 'Terjadi kesalahan tidak terduga saat meminta revisi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>Minta Revisi Proposal</DialogTitle>
        <DialogDescription>
          Berikan catatan untuk revisi proposal. Mahasiswa akan menerima feedback dan dapat melakukan perbaikan.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center my-4 p-4 bg-amber-50 rounded-md border border-amber-100">
        <FileEdit className="h-12 w-12 text-amber-500 mb-2" />
        <p className="text-center text-gray-600">
          Proposal akan dikembalikan ke mahasiswa untuk diperbaiki sesuai catatan yang diberikan.
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="revision-feedback" className="block text-sm font-medium mb-2">
            Catatan Revisi *
          </label>
          <Textarea
            id="revision-feedback"
            placeholder="Masukkan catatan untuk perbaikan proposal..."
            value={revisionFeedback}
            onChange={(e) => setRevisionFeedback(e.target.value)}
            className="min-h-[100px]"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button 
            className="bg-amber-500 hover:bg-amber-600"
            disabled={isSubmitting || !revisionFeedback.trim()}
            onClick={handleRevision}
          >
            {isSubmitting ? "Memproses..." : "Kirim Revisi"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default RevisionDialog;
