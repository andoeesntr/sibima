
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ProposalApprovalService } from '@/services/proposalApprovalService';

interface ApproveDialogProps {
  onCancel: () => void;
  onApprove: () => void;
  proposalId: string;
}

const ApproveDialog = ({ onCancel, onApprove, proposalId }: ApproveDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      console.log('🚀 Starting proposal approval process for:', proposalId);
      
      // Optional: Get debug info first
      if (process.env.NODE_ENV === 'development') {
        const debugData = await ProposalApprovalService.getProposalTeamInfo(proposalId);
        setDebugInfo(debugData);
        console.log('🔍 Debug info:', debugData);
      }
      
      const result = await ProposalApprovalService.approveProposal(proposalId);
      
      if (result.success) {
        console.log('✅ Proposal approval completed successfully');
        
        // Show detailed success message
        let successMessage = result.message;
        if (result.affectedProposals && result.affectedProposals > 1) {
          successMessage += ` (${result.affectedProposals} anggota tim)`;
        }
        
        toast.success(successMessage);
        
        // Show warning if there were partial failures
        if (result.failedUpdates && result.failedUpdates.length > 0) {
          toast.warning(`Beberapa proposal gagal diupdate: ${result.failedUpdates.length} dari ${result.affectedProposals}`);
        }
        
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

        // Show bulk error info if available
        if (result.bulkError) {
          console.error('💥 Bulk operation error:', result.bulkError);
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

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Debug Information</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
          
          {showDebug && debugInfo && (
            <div className="text-xs text-blue-600 bg-white p-2 rounded border">
              <p><strong>Proposal:</strong> {debugInfo.proposal?.title}</p>
              <p><strong>Team ID:</strong> {debugInfo.proposal?.team_id || 'Individual'}</p>
              <p><strong>Team Members:</strong> {debugInfo.teamMembers?.length || 0}</p>
              <p><strong>Team Proposals:</strong> {debugInfo.teamProposals?.length || 0}</p>
            </div>
          )}
        </div>
      )}
      
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
