
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const createBucketIfNotExists = async (): Promise<boolean> => {
  try {
    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      throw new Error(`Could not list buckets: ${bucketsError.message}`);
    }
    
    // Check if signatures bucket exists
    const signaturesBucketExists = buckets?.find(bucket => bucket.name === 'signatures');
    
    // If bucket doesn't exist, create it using functions service
    if (!signaturesBucketExists) {
      console.log('Signatures bucket not found, creating it...');
      
      // Use service role to create bucket (can't create buckets with normal permissions)
      const { error: createBucketError, data } = await supabase.functions.invoke(
        'create-storage-bucket',
        {
          body: {
            name: 'signatures',
            public: true
          }
        }
      );
      
      if (createBucketError) {
        throw new Error(`Failed to create signatures bucket: ${createBucketError.message}`);
      }
      
      console.log('Bucket creation response:', data);
      
      // Add a small delay to ensure the bucket and policies are properly created
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return true;
  } catch (error: any) {
    console.error('Error checking/creating bucket:', error);
    throw error;
  }
};

export const uploadSignature = async (
  file: File, 
  userId: string
): Promise<string> => {
  // Ensure the bucket exists
  await createBucketIfNotExists();

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
      
      // Call edge function with authentication
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-signature`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Edge function error: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      return responseData.publicUrl;
    }
    
    // If direct upload succeeded, get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('signatures')
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(`Storage permission error: ${error.message}`);
  }
};

export const saveSignatureToDatabase = async (
  userId: string, 
  publicUrl: string
): Promise<void> => {
  try {
    // Use the update-signature edge function to save to database with service role
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
  } catch (error: any) {
    console.error('Error saving signature to database:', error);
    throw error;
  }
};

export const deleteSignature = async (userId: string): Promise<void> => {
  try {
    // Use the update-signature edge function to delete from database with service role
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
  } catch (error: any) {
    console.error('Error deleting signature:', error);
    throw error;
  }
};
