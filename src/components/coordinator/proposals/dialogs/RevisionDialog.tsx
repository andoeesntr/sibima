
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { FileEdit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { syncProposalStatusWithTeam } from '@/services/proposalService';

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
          status: 'revision',
          rejection_reason: revisionFeedback, // Using rejection_reason field for revision feedback
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId);
        
      if (error) throw error;
      
      // Log the activity
      await supabase.from('activity_logs').insert({
        action: `Meminta revisi proposal "${proposal?.title}" dari ${proposal?.profiles?.full_name}`,
        target_type: 'proposal',
        target_id: proposalId,
        user_id: user?.id || 'coordinator',
        user_name: profile?.full_name || 'Coordinator'
      });
      
      // Sync status with team members
      await syncProposalStatusWithTeam(proposalId, 'revision', revisionFeedback);
      
      toast.success("Permintaan revisi berhasil dikirim");
      onRevision();
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast.error("Gagal meminta revisi");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>Minta Revisi Proposal</DialogTitle>
        <DialogDescription>
          Berikan catatan revisi untuk proposal ini
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 my-4">
        <div className="flex flex-col items-center justify-center p-4 bg-amber-50 rounded-md border border-amber-100 mb-4">
          <FileEdit className="h-12 w-12 text-amber-500 mb-2" />
          <p className="text-center text-gray-600">
            Mahasiswa perlu merevisi proposal sesuai dengan catatan yang diberikan.
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="revision-feedback" className="text-sm font-medium">
            Catatan Revisi
          </label>
          <Textarea
            id="revision-feedback"
            placeholder="Tuliskan catatan revisi untuk proposal ini..."
            value={revisionFeedback}
            onChange={(e) => setRevisionFeedback(e.target.value)}
            rows={4}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button 
          className="bg-amber-500 hover:bg-amber-600 text-white"
          disabled={isSubmitting || !revisionFeedback.trim()}
          onClick={handleRevision}
        >
          {isSubmitting ? "Memproses..." : "Minta Revisi"}
        </Button>
      </div>
    </>
  );
};

export default RevisionDialog;
