
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';
import { toast } from 'sonner';

export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('Fetching profile for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    if (data) {
      console.log('Profile data retrieved:', data);
      return data as Profile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<boolean> => {
  try {
    console.log('Updating profile with:', updates);
    
    // Get current user info for activity log
    const { data: { user } } = await supabase.auth.getUser();
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', userId)
      .single();

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
      
    if (error) {
      throw error;
    }

    // Log the activity if it's a coordinator updating profile
    if (currentProfile?.role === 'coordinator') {
      await supabase.from('activity_logs').insert({
        action: `Memperbarui profil`,
        target_type: 'profile',
        target_id: userId,
        user_id: user?.id || userId,
        user_name: updates.full_name || currentProfile?.full_name || 'Coordinator'
      });
    }
    
    toast.success('Profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
