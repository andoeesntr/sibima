
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const changePassword = async (newPassword: string): Promise<boolean> => {
  try {
    // Get current user info for activity log
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user?.id)
      .single();

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    // Log the activity if it's a coordinator
    if (profile?.role === 'coordinator') {
      await supabase.from('activity_logs').insert({
        action: `Mengganti password`,
        target_type: 'account',
        target_id: user?.id,
        user_id: user?.id || 'coordinator',
        user_name: profile?.full_name || 'Coordinator'
      });
    }

    toast.success('Password berhasil diubah');
    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    toast.error('Gagal mengubah password');
    return false;
  }
};
