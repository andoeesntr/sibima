
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { XCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { syncProposalStatusWithTeam } from '@/services/proposalService';

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
      toast.error("Alasan penolakan harus diisi");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Update proposal status and rejection reason
      const { error } = await supabase
        .from('proposals')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId);
        
      if (error) throw error;
      
      // Log the activity
      await supabase.from('activity_logs').insert({
        action: 'rejected',
        target_type: 'proposal',
        target_id: proposalId,
        user_id: 'coordinator', // Ideally this should be the actual coordinator ID
        user_name: 'Coordinator' // Ideally this should be the actual coordinator name
      });
      
      // Sync status with team members
      await syncProposalStatusWithTeam(proposalId, 'rejected', rejectionReason);
      
      toast.success("Proposal telah ditolak");
      onReject();
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      toast.error("Gagal menolak proposal");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>Tolak Proposal</DialogTitle>
        <DialogDescription>
          Berikan alasan mengapa proposal ini ditolak.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center my-4 p-4 bg-red-50 rounded-md border border-red-100">
        <XCircle className="h-12 w-12 text-red-500 mb-2" />
        <p className="text-center text-gray-600">
          Mahasiswa perlu mengajukan proposal baru setelah proposal ini ditolak.
        </p>
      </div>
      <div className="mt-4">
        <Textarea
          placeholder="Masukkan alasan penolakan proposal..."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows={4}
        />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button 
          variant="destructive"
          disabled={isSubmitting || !rejectionReason.trim()}
          onClick={handleReject}
        >
          {isSubmitting ? "Memproses..." : "Tolak"}
        </Button>
      </div>
    </>
  );
};

export default RejectDialog;
