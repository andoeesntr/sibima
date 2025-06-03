
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
    
    console.log('Upload successful, public URL:', publicUrl);
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
    
    // Always use edge function to ensure reliable database operations
    console.log('Using edge function for database save');
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
    
    // Add a small delay and verify the signature was saved
    setTimeout(async () => {
      try {
        const { data: verifyData, error: verifyError } = await supabase
          .from('digital_signatures')
          .select('id, signature_url, status')
          .eq('supervisor_id', userId)
          .single();
        
        if (verifyError) {
          console.error('Verification error:', verifyError);
        } else {
          console.log('Signature verification successful:', verifyData);
        }
      } catch (verifyError) {
        console.error('Failed to verify signature:', verifyError);
      }
    }, 1000);
    
  } catch (error: any) {
    console.error('Error saving signature to database:', error);
    throw error;
  }
};

export const deleteSignature = async (userId: string): Promise<void> => {
  try {
    console.log('Deleting signature for user:', userId);
    
    // Use edge function for delete operation
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
    
    console.log('Signature deletion successful:', functionData);
  } catch (error: any) {
    console.error('Error deleting signature:', error);
    throw error;
  }
};
