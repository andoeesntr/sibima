
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
      console.log('Starting proposal approval process for:', proposalId);
      
      // Get current user info
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user:', userError);
        throw new Error('User authentication failed');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error getting profile:', profileError);
        // Continue with default name if profile fetch fails
      }

      // Get proposal info for activity log
      const { data: proposal, error: proposalFetchError } = await supabase
        .from('proposals')
        .select('title, student_id, profiles!student_id(full_name)')
        .eq('id', proposalId)
        .single();

      if (proposalFetchError) {
        console.error('Error fetching proposal:', proposalFetchError);
        throw new Error('Failed to fetch proposal details');
      }

      console.log('Proposal data:', proposal);

      // Update proposal status
      const { error: updateError } = await supabase
        .from('proposals')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId);
        
      if (updateError) {
        console.error('Error updating proposal:', updateError);
        throw new Error('Failed to update proposal status');
      }

      console.log('Proposal status updated successfully');

      // Try to log the activity (don't fail if this fails)
      try {
        await supabase.from('activity_logs').insert({
          action: `Menyetujui proposal "${proposal?.title}" dari ${proposal?.profiles?.full_name}`,
          target_type: 'proposal',
          target_id: proposalId,
          user_id: user.id,
          user_name: profile?.full_name || 'Coordinator'
        });
        console.log('Activity logged successfully');
      } catch (logError) {
        console.error('Failed to log activity (non-critical):', logError);
        // Don't throw error for logging failure
      }
      
      // Sync status with team members
      try {
        await syncProposalStatusWithTeam(proposalId, 'approved');
        console.log('Team sync completed successfully');
      } catch (syncError) {
        console.error('Error syncing with team (non-critical):', syncError);
        // Don't throw error for sync failure
      }
      
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
