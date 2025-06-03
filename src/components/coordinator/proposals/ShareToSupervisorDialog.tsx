
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';

interface Supervisor {
  id: string;
  full_name: string;
  email: string;
}

interface ShareToSupervisorDialogProps {
  onCancel: () => void;
  onShare: () => void;
  proposalId: string;
}

const ShareToSupervisorDialog = ({ onCancel, onShare, proposalId }: ShareToSupervisorDialogProps) => {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'supervisor')
        .order('full_name');

      if (error) {
        console.error('Error fetching supervisors:', error);
        throw error;
      }

      setSupervisors(data || []);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
      toast.error('Gagal memuat daftar dosen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupervisorToggle = (supervisorId: string) => {
    setSelectedSupervisors(prev => 
      prev.includes(supervisorId) 
        ? prev.filter(id => id !== supervisorId)
        : [...prev, supervisorId]
    );
  };

  const handleShare = async () => {
    if (selectedSupervisors.length === 0) {
      toast.error('Pilih minimal satu dosen untuk dibagikan proposal');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Sharing proposal to supervisors:', selectedSupervisors);

      // Get current user info
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User authentication failed');
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Get proposal info
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select('title, student_id, profiles!student_id(full_name)')
        .eq('id', proposalId)
        .single();

      if (proposalError) {
        console.error('Error fetching proposal:', proposalError);
        throw new Error('Failed to fetch proposal details');
      }

      // Create notifications for selected supervisors
      const notifications = selectedSupervisors.map(supervisorId => ({
        user_id: supervisorId,
        title: 'Proposal Baru Dibagikan',
        message: `Proposal "${proposal?.title}" dari ${proposal?.profiles?.full_name} telah dibagikan kepada Anda untuk ditinjau`,
        type: 'proposal_shared',
        related_id: proposalId
      }));

      console.log('Creating notifications:', notifications);

      const { error: notificationError } = await supabase
        .from('kp_notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error creating notifications:', notificationError);
        throw new Error('Failed to notify supervisors');
      }

      // Log activity
      try {
        const supervisorNames = supervisors
          .filter(s => selectedSupervisors.includes(s.id))
          .map(s => s.full_name)
          .join(', ');

        const activityData = {
          action: `Membagikan proposal "${proposal?.title}" kepada dosen: ${supervisorNames}`,
          target_type: 'proposal',
          target_id: proposalId,
          user_id: user.id,
          user_name: profile?.full_name || 'Coordinator'
        };

        console.log('Logging activity:', activityData);

        const { error: logError } = await supabase
          .from('activity_logs')
          .insert(activityData);

        if (logError) {
          console.error('Activity log error:', logError);
        }
      } catch (logError) {
        console.error('Failed to log activity (non-critical):', logError);
      }

      toast.success(`Proposal berhasil dibagikan kepada ${selectedSupervisors.length} dosen`);
      onShare();
    } catch (error: any) {
      console.error('Error sharing proposal:', error);
      const errorMessage = error.message || 'Terjadi kesalahan saat membagikan proposal';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Bagikan ke Dosen</DialogTitle>
          <DialogDescription>
            Memuat daftar dosen...
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Bagikan ke Dosen</DialogTitle>
        <DialogDescription>
          Pilih dosen yang akan menerima proposal ini untuk ditinjau.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 max-h-60 overflow-y-auto">
        {supervisors.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Tidak ada dosen yang tersedia</p>
        ) : (
          supervisors.map((supervisor) => (
            <div key={supervisor.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
              <Checkbox
                id={supervisor.id}
                checked={selectedSupervisors.includes(supervisor.id)}
                onCheckedChange={() => handleSupervisorToggle(supervisor.id)}
              />
              <label
                htmlFor={supervisor.id}
                className="flex-1 cursor-pointer"
              >
                <div className="font-medium">{supervisor.full_name}</div>
                <div className="text-sm text-gray-500">{supervisor.email}</div>
              </label>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button 
          className="bg-primary hover:bg-primary/90"
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
