
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchAvailableSupervisors();
    // Initialize selected supervisors
    setSelectedSupervisorIds(currentSupervisors.map(s => s.id));
  }, [currentSupervisors]);

  const fetchAvailableSupervisors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, profile_image')
        .eq('role', 'supervisor');

      if (error) throw error;
      setAvailableSupervisors(data || []);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
      setError('Gagal memuat daftar dosen pembimbing');
    }
  };

  const handleSupervisorSelect = (index: number, supervisorId: string) => {
    const newSelectedIds = [...selectedSupervisorIds];
    newSelectedIds[index] = supervisorId;
    setSelectedSupervisorIds(newSelectedIds);
    setError('');
  };

  const handleUpdateSupervisors = async () => {
    // Filter out empty selections
    const validSupervisorIds = selectedSupervisorIds.filter(id => id && id.trim() !== '');
    
    if (validSupervisorIds.length === 0) {
      setError('Pilih minimal satu dosen pembimbing');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Get current user info for activity log
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

      if (teamId) {
        // Remove existing supervisors for the team
        await supabase
          .from('team_supervisors')
          .delete()
          .eq('team_id', teamId);

        // Add new supervisors
        const supervisorInserts = validSupervisorIds.map(supervisorId => ({
          team_id: teamId,
          supervisor_id: supervisorId
        }));

        const { error: insertError } = await supabase
          .from('team_supervisors')
          .insert(supervisorInserts);

        if (insertError) throw insertError;
      } else {
        // Update proposal directly with the first supervisor
        const { error: updateError } = await supabase
          .from('proposals')
          .update({ supervisor_id: validSupervisorIds[0] })
          .eq('id', proposalId);

        if (updateError) throw updateError;
      }

      // Get supervisor names for activity log
      const { data: supervisorProfiles } = await supabase
        .from('profiles')
        .select('full_name')
        .in('id', validSupervisorIds);

      const supervisorNames = supervisorProfiles?.map(s => s.full_name).join(', ') || '';

      // Log the activity
      await supabase.from('activity_logs').insert({
        action: `Mengedit dosen pembimbing untuk proposal "${proposal?.title}" dari ${proposal?.profiles?.full_name}. Dosen pembimbing: ${supervisorNames}`,
        target_type: 'proposal',
        target_id: proposalId,
        user_id: user?.id || 'coordinator',
        user_name: profile?.full_name || 'Coordinator'
      });

      // Fetch updated supervisors
      const updatedSupervisors = availableSupervisors.filter(supervisor => 
        validSupervisorIds.includes(supervisor.id)
      );

      onSupervisorsUpdated(updatedSupervisors);
      toast.success('Dosen pembimbing berhasil diperbarui');
      onClose();
    } catch (error: any) {
      console.error('Error updating supervisors:', error);
      setError('Gagal memperbarui dosen pembimbing: ' + error.message);
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
