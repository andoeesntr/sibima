
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Supervisor } from '@/services/supervisorService';

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
  const [availableSupervisors, setAvailableSupervisors] = useState<Supervisor[]>([]);
  const [selectedSupervisorIds, setSelectedSupervisorIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSupervisors();
      // Initialize selected supervisors from current
      setSelectedSupervisorIds(currentSupervisors.map(s => s.id));
      setError(null);
    }
  }, [isOpen, currentSupervisors]);

  const fetchSupervisors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, profile_image')
        .eq('role', 'supervisor');
        
      if (error) throw error;
      setAvailableSupervisors(data || []);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
      toast.error("Gagal memuat daftar dosen pembimbing");
    }
  };

  const handleUpdateSupervisors = async () => {
    if (!proposalId) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // First update the proposal with the first supervisor
      const { error: proposalError } = await supabase
        .from('proposals')
        .update({ 
          supervisor_id: selectedSupervisorIds[0] || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId);
        
      if (proposalError) throw proposalError;
      
      // If we have a team, update or create team_supervisors records
      if (teamId) {
        // First delete existing team_supervisors for this team
        const { error: deleteError } = await supabase
          .from('team_supervisors')
          .delete()
          .eq('team_id', teamId);
          
        if (deleteError) throw deleteError;
        
        // Then insert new team_supervisors
        const teamSupervisorsToInsert = selectedSupervisorIds
          .filter(id => id) // Filter out null/empty values
          .map(supervisorId => ({
            team_id: teamId,
            supervisor_id: supervisorId,
          }));
          
        if (teamSupervisorsToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('team_supervisors')
            .insert(teamSupervisorsToInsert);
            
          if (insertError) {
            console.error("Error inserting team supervisors:", insertError);
            throw insertError;
          }
        }
      }
      
      // Get the supervisor details for the updated list
      const updatedSupervisors: Supervisor[] = [];
      
      for (const supervisorId of selectedSupervisorIds) {
        if (!supervisorId) continue;
        
        const { data: supervisorData, error: supervisorError } = await supabase
          .from('profiles')
          .select('id, full_name, profile_image')
          .eq('id', supervisorId)
          .single();
          
        if (supervisorError) {
          console.error("Error fetching supervisor details:", supervisorError);
          continue;
        }
        
        if (supervisorData) {
          updatedSupervisors.push({
            id: supervisorData.id,
            full_name: supervisorData.full_name,
            profile_image: supervisorData.profile_image
          });
        }
      }
      
      onSupervisorsUpdated(updatedSupervisors);
      toast.success('Dosen pembimbing berhasil diperbarui');
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error updating supervisors:", error);
      setError(error.message || 'Gagal memperbarui dosen pembimbing');
      toast.error(`Gagal memperbarui dosen pembimbing: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSupervisorSelect = (index: number, value: string) => {
    const newSelected = [...selectedSupervisorIds];
    newSelected[index] = value;
    setSelectedSupervisorIds(newSelected);
  };

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
          <div className="space-y-2">
            <Label htmlFor="supervisor-select-1">Dosen Pembimbing 1</Label>
            <Select 
              value={selectedSupervisorIds[0] || ''} 
              onValueChange={(value) => handleSupervisorSelect(0, value)}
            >
              <SelectTrigger id="supervisor-select-1">
                <SelectValue placeholder="Pilih dosen pembimbing" />
              </SelectTrigger>
              <SelectContent>
                {availableSupervisors.map((supervisor) => (
                  <SelectItem key={supervisor.id} value={supervisor.id}>
                    {supervisor.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Second Supervisor */}
          <div className="space-y-2">
            <Label htmlFor="supervisor-select-2">Dosen Pembimbing 2</Label>
            <Select 
              value={selectedSupervisorIds[1] || ''} 
              onValueChange={(value) => handleSupervisorSelect(1, value)}
            >
              <SelectTrigger id="supervisor-select-2">
                <SelectValue placeholder="Pilih dosen pembimbing" />
              </SelectTrigger>
              <SelectContent>
                {availableSupervisors.map((supervisor) => (
                  <SelectItem key={supervisor.id} value={supervisor.id}>
                    {supervisor.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
