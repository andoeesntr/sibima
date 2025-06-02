
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Share2, Check } from 'lucide-react';
import { shareProposalWithSupervisors } from '@/services/proposalService';

interface ShareToSupervisorDialogProps {
  onCancel: () => void;
  onShare: () => void;
  proposalId: string;
  supervisors: Array<{
    id: string;
    full_name: string;
  }>;
}

const ShareToSupervisorDialog = ({ onCancel, onShare, proposalId, supervisors }: ShareToSupervisorDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSupervisors, setSelectedSupervisors] = useState<string[]>([]);
  
  const handleShare = async () => {
    if (selectedSupervisors.length === 0) {
      toast.error("Pilih minimal satu dosen pembimbing");
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('Sharing proposal to supervisors:', selectedSupervisors);
      
      await shareProposalWithSupervisors(proposalId, selectedSupervisors);
      
      toast.success(`Proposal berhasil dibagikan ke ${selectedSupervisors.length} dosen pembimbing`);
      onShare();
    } catch (error: any) {
      console.error('Error sharing proposal:', error);
      const errorMessage = error.message || 'Terjadi kesalahan saat membagikan proposal';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSupervisor = (supervisorId: string) => {
    setSelectedSupervisors(prev => 
      prev.includes(supervisorId) 
        ? prev.filter(id => id !== supervisorId)
        : [...prev, supervisorId]
    );
  };
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>Bagikan Proposal ke Dosen</DialogTitle>
        <DialogDescription>
          Pilih dosen pembimbing yang akan menerima proposal ini untuk review.
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex flex-col items-center justify-center my-4 p-4 bg-blue-50 rounded-md border border-blue-100">
        <Share2 className="h-12 w-12 text-blue-500 mb-2" />
        <p className="text-center text-gray-600 mb-4">
          Proposal akan dibagikan langsung ke dosen yang dipilih tanpa perlu persetujuan koordinator terlebih dahulu.
        </p>
        
        <div className="w-full space-y-2">
          <p className="font-medium text-sm text-gray-700">Pilih Dosen Pembimbing:</p>
          {supervisors.length > 0 ? (
            <div className="space-y-2">
              {supervisors.map((supervisor) => (
                <div 
                  key={supervisor.id}
                  className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedSupervisors.includes(supervisor.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => toggleSupervisor(supervisor.id)}
                >
                  <span className="text-sm font-medium">{supervisor.full_name}</span>
                  {selectedSupervisors.includes(supervisor.id) && (
                    <Check className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Tidak ada dosen pembimbing tersedia
            </p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button 
          className="bg-blue-500 hover:bg-blue-600"
          disabled={isSubmitting || selectedSupervisors.length === 0}
          onClick={handleShare}
        >
          {isSubmitting ? "Membagikan..." : `Bagikan ke ${selectedSupervisors.length} Dosen`}
        </Button>
      </div>
    </>
  );
};

export default ShareToSupervisorDialog;
