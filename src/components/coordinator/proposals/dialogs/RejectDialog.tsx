
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { XCircle } from 'lucide-react';
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
      toast.error("Harap berikan alasan penolakan");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Get current user info
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      // Get proposal info for activity log
      const { data: proposal } = await supabase
        .from('proposals')
        .select('title, student_id, profiles!student_id(full_name)')
        .eq('id', proposalId)
        .single();

      // Update proposal status
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
        action: `Menolak proposal "${proposal?.title}" dari ${proposal?.profiles?.full_name}`,
        target_type: 'proposal',
        target_id: proposalId,
        user_id: user?.id || 'coordinator',
        user_name: profile?.full_name || 'Coordinator'
      });
      
      // Sync status with team members
      await syncProposalStatusWithTeam(proposalId, 'rejected', rejectionReason);
      
      toast.success("Proposal berhasil ditolak");
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
          Berikan alasan penolakan untuk proposal ini
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 my-4">
        <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-md border border-red-100 mb-4">
          <XCircle className="h-12 w-12 text-red-500 mb-2" />
          <p className="text-center text-gray-600">
            Proposal yang ditolak akan memerlukan mahasiswa untuk mengajukan proposal baru.
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="rejection-reason" className="text-sm font-medium">
            Alasan Penolakan
          </label>
          <Textarea
            id="rejection-reason"
            placeholder="Tuliskan alasan penolakan proposal ini..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
        </div>
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
          {isSubmitting ? "Memproses..." : "Tolak Proposal"}
        </Button>
      </div>
    </>
  );
};

export default RejectDialog;
