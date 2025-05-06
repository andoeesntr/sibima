
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Supervisor } from '@/services/supervisorService';

interface UseSupervisorSelectionProps {
  proposalId: string;
  teamId?: string | null;
  currentSupervisors: Supervisor[];
  onSupervisorsUpdated: (supervisors: Supervisor[]) => void;
  onClose: () => void;
}

export const useSupervisorSelection = ({
  proposalId,
  teamId,
  currentSupervisors,
  onSupervisorsUpdated,
  onClose
}: UseSupervisorSelectionProps) => {
  const [availableSupervisors, setAvailableSupervisors] = useState<Supervisor[]>([]);
  const [selectedSupervisorIds, setSelectedSupervisorIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSupervisors();
    // Initialize selected supervisors from current
    setSelectedSupervisorIds(currentSupervisors.map(s => s.id));
    setError(null);
  }, [currentSupervisors]);

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

  const handleSupervisorSelect = (index: number, value: string) => {
    const newSelected = [...selectedSupervisorIds];
    newSelected[index] = value;
    setSelectedSupervisorIds(newSelected);
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
      onClose();
    } catch (error: any) {
      console.error("Error updating supervisors:", error);
      setError(error.message || 'Gagal memperbarui dosen pembimbing');
      toast.error(`Gagal memperbarui dosen pembimbing: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    availableSupervisors,
    selectedSupervisorIds,
    isSubmitting,
    error,
    handleSupervisorSelect,
    handleUpdateSupervisors
  };
};
