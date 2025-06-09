
import { supabase } from '@/integrations/supabase/client';

export interface LogActivityParams {
  actionType: 'proposal_action' | 'evaluation' | 'download' | 'upload' | 'timesheet' | 'system';
  actionDescription: string;
  targetType?: 'proposal' | 'evaluation' | 'timesheet' | 'document' | null;
  targetId?: string | null;
  metadata?: any;
}

export const logActivity = async (params: LogActivityParams) => {
  try {
    // Get current user info
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      console.error('User profile not found');
      return;
    }

    // Insert activity log
    const { error } = await supabase
      .from('system_activity_logs')
      .insert({
        user_id: user.id,
        user_name: profile.full_name || 'Unknown User',
        user_role: profile.role,
        action_type: params.actionType,
        action_description: params.actionDescription,
        target_type: params.targetType,
        target_id: params.targetId,
        metadata: params.metadata
      });

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error in logActivity:', error);
  }
};

// Convenience functions for common activities
export const logDownloadActivity = async (fileName: string, fileType: string) => {
  await logActivity({
    actionType: 'download',
    actionDescription: `Mendownload ${fileType} "${fileName}"`,
    targetType: 'document',
    metadata: { fileName, fileType }
  });
};

export const logUploadActivity = async (fileName: string, fileType: string) => {
  await logActivity({
    actionType: 'upload',
    actionDescription: `Mengunggah ${fileType} "${fileName}"`,
    targetType: 'document',
    metadata: { fileName, fileType }
  });
};

export const logSystemActivity = async (description: string, metadata?: any) => {
  await logActivity({
    actionType: 'system',
    actionDescription: description,
    metadata
  });
};
