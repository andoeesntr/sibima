
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Supervisor } from '@/services/supervisorService';
import SupervisorSelect from './SupervisorSelect';
import { useSupervisorSelection } from '@/hooks/useSupervisorSelection';

interface SupervisorEditDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  proposalId: string;
  teamId?: string | null;
  currentSupervisors: Supervisor[];
  onSupervisorsUpdated: (supervisors: Supervisor[]) => void;
}

const SupervisorEditDialog = ({
  isOpen,
  setIsOpen,
  proposalId,
  teamId,
  currentSupervisors,
  onSupervisorsUpdated
}: SupervisorEditDialogProps) => {
  const {
    availableSupervisors,
    selectedSupervisorIds,
    isSubmitting,
    error,
    handleSupervisorSelect,
    handleUpdateSupervisors
  } = useSupervisorSelection({
    proposalId,
    teamId,
    currentSupervisors,
    onSupervisorsUpdated,
    onClose: () => setIsOpen(false)
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Dosen Pembimbing</DialogTitle>
          <DialogDescription>
            Pilih dosen pembimbing untuk proposal ini.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {/* First Supervisor */}
          <SupervisorSelect 
            index={0}
            value={selectedSupervisorIds[0] || ''}
            supervisors={availableSupervisors}
            onSelect={handleSupervisorSelect}
            disabled={isSubmitting}
          />
          
          {/* Second Supervisor */}
          <SupervisorSelect 
            index={1}
            value={selectedSupervisorIds[1] || ''}
            supervisors={availableSupervisors}
            onSelect={handleSupervisorSelect}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button 
            onClick={handleUpdateSupervisors}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupervisorEditDialog;
