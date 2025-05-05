
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
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `signatures/${fileName}`;
  
  console.log('Uploading signature to storage:', filePath);
  
  // Upload to storage
  const { error: storageError } = await supabase
    .storage
    .from('signatures')
    .upload(filePath, file, {
      upsert: true
    });
    
  if (storageError) {
    console.error('Storage error:', storageError);
    
    // If it's a permissions error, try using the edge function with service role
    if (storageError.message.includes('policy') || storageError.message.includes('permission')) {
      console.log('Attempting upload with service role through edge function...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('path', fileName);
      
      try {
        const response = await fetch(`https://ciaymvntmwwbnvewedue.supabase.co/functions/v1/upload-signature`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`
          },
          body: formData
        });
        
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Unknown error during upload');
        }
        
        return data.publicUrl;
      } catch (edgeFunctionError) {
        console.error('Edge function upload error:', edgeFunctionError);
        throw new Error(`Storage permission error: ${storageError.message}`);
      }
    }
    
    throw new Error(`Storage error: ${storageError.message}`);
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('signatures')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const saveSignatureToDatabase = async (
  userId: string, 
  publicUrl: string
): Promise<void> => {
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
};

export const deleteSignature = async (userId: string): Promise<void> => {
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
    throw functionError;
  }
};
