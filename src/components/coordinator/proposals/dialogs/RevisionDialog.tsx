
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileEdit } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
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
      toast.error("Feedback revisi harus diisi");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Update proposal status
      const { error: updateError } = await supabase
        .from('proposals')
        .update({
          status: 'revision',
          rejection_reason: revisionFeedback,  // Using the rejection_reason field for revision feedback
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId);
        
      if (updateError) throw updateError;

      // Get coordinator info to attach to feedback
      const { data: coordinatorData } = await supabase
        .auth.getUser();
      
      const coordinatorId = coordinatorData?.user?.id || 'unknown';
      
      // Add feedback to proposal_feedback table
      const { error: feedbackError } = await supabase
        .from('proposal_feedback')
        .insert({
          proposal_id: proposalId,
          supervisor_id: coordinatorId,  // Using coordinator ID as feedback provider
          content: revisionFeedback
        });
        
      if (feedbackError) {
        console.error('Error adding feedback:', feedbackError);
      }
      
      // Log the activity
      await supabase.from('activity_logs').insert({
        action: 'revision',
        target_type: 'proposal',
        target_id: proposalId,
        user_id: coordinatorId,
        user_name: 'Coordinator'  // Ideally would be the actual name
      });
      
      // Sync status with team members
      await syncProposalStatusWithTeam(proposalId, 'revision', revisionFeedback);
      
      toast.success("Proposal memerlukan revisi");
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
          Berikan feedback untuk revisi proposal ini.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center my-4 p-4 bg-amber-50 rounded-md border border-amber-100">
        <FileEdit className="h-12 w-12 text-amber-500 mb-2" />
        <p className="text-center text-gray-600">
          Mahasiswa perlu merevisi proposal berdasarkan feedback yang Anda berikan.
        </p>
      </div>
      <div className="mt-4">
        <Textarea
          placeholder="Masukkan feedback untuk revisi..."
          value={revisionFeedback}
          onChange={(e) => setRevisionFeedback(e.target.value)}
          rows={4}
        />
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
