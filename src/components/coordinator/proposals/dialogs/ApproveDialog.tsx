
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId);
        
      if (error) throw error;
      
      // Log the activity
      await supabase.from('activity_logs').insert({
        action: `Menyetujui proposal "${proposal?.title}" dari ${proposal?.profiles?.full_name}`,
        target_type: 'proposal',
        target_id: proposalId,
        user_id: user?.id || 'coordinator',
        user_name: profile?.full_name || 'Coordinator'
      });
      
      // Sync status with team members
      await syncProposalStatusWithTeam(proposalId, 'approved');
      
      toast.success("Proposal berhasil disetujui");
      onApprove();
    } catch (error) {
      console.error('Error approving proposal:', error);
      toast.error("Gagal menyetujui proposal");
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
