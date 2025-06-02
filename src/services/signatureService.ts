
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const uploadSignature = async (
  file: File, 
  userId: string
): Promise<string> => {
  // Upload file to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;
  
  console.log('Uploading signature to storage:', filePath);
  
  try {
    // Try direct upload first (if permissions allow)
    const { error: storageError, data } = await supabase
      .storage
      .from('signatures')
      .upload(filePath, file, {
        upsert: true
      });
      
    if (storageError) {
      console.log('Direct upload failed, trying edge function:', storageError.message);
      
      // Fall back to edge function with service role
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('path', fileName);
      
      // Get current session token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('No authentication token available');
      }
      
      // Get Supabase URL from client
      const supabaseUrl = "https://ciaymvntmwwbnvewedue.supabase.co";
      
      // Call edge function with authentication
      const response = await fetch(`${supabaseUrl}/functions/v1/upload-signature`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Edge function error: ${response.statusText}`);
        } catch (parseError) {
          throw new Error(`Server error (${response.status}): Please try again later`);
        }
      }
      
      const responseText = await response.text();
      try {
        const responseData = JSON.parse(responseText);
        return responseData.publicUrl;
      } catch (parseError) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid response from server');
      }
    }
    
    // If direct upload succeeded, get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('signatures')
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

export const saveSignatureToDatabase = async (
  userId: string, 
  publicUrl: string
): Promise<void> => {
  try {
    console.log('Saving signature to database:', { userId, publicUrl });
    
    // First try direct database insert/update
    const { data: existingSignature, error: fetchError } = await supabase
      .from('digital_signatures')
      .select('*')
      .eq('supervisor_id', userId)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking existing signature:', fetchError);
    }
    
    let result;
    if (existingSignature) {
      console.log('Updating existing signature');
      const { data, error } = await supabase
        .from('digital_signatures')
        .update({
          signature_url: publicUrl,
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('supervisor_id', userId)
        .select();
      
      result = { data, error };
    } else {
      console.log('Creating new signature record');
      const { data, error } = await supabase
        .from('digital_signatures')
        .insert({
          supervisor_id: userId,
          signature_url: publicUrl,
          status: 'pending'
        })
        .select();
      
      result = { data, error };
    }
    
    if (result.error) {
      console.error('Direct database operation failed:', result.error);
      
      // Fall back to edge function
      console.log('Falling back to edge function for database save');
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'update-signature',
        {
          body: {
            supervisor_id: userId,
            status: 'pending',
            signature_url: publicUrl
          }
        }
      );
      
      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(`Function error: ${functionError.message}`);
      }
      
      console.log('Successfully saved via edge function:', functionData);
    } else {
      console.log('Successfully saved to database:', result.data);
    }
  } catch (error: any) {
    console.error('Error saving signature to database:', error);
    throw error;
  }
};

export const deleteSignature = async (userId: string): Promise<void> => {
  try {
    console.log('Deleting signature for user:', userId);
    
    // Try direct delete first
    const { error: directError } = await supabase
      .from('digital_signatures')
      .delete()
      .eq('supervisor_id', userId);
    
    if (directError) {
      console.error('Direct delete failed:', directError);
      
      // Fall back to edge function
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'update-signature',
        {
          body: {
            supervisor_id: userId,
            status: 'deleted'
          }
        }
      );
      
      if (functionError) {
        console.error('Error deleting signature:', functionError);
        throw new Error(`Function error: ${functionError.message}`);
      }
    }
  } catch (error: any) {
    console.error('Error deleting signature:', error);
    throw error;
  }
};
