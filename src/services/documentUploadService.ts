
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ensureKpDocumentsBucketExists = async (): Promise<boolean> => {
  try {
    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'kp-documents');
    
    if (!bucketExists) {
      console.log('kp-documents bucket not found, creating it...');
      
      // Try direct creation first
      const { error: createError } = await supabase.storage
        .createBucket('kp-documents', {
          public: true,
          fileSizeLimit: 10485760 // 10MB limit
        });
      
      if (createError) {
        console.log('Direct bucket creation failed, trying via edge function');
        
        // Try using edge function instead
        const { error: funcError } = await supabase.functions.invoke('upload-file', {
          body: { 
            action: 'create_bucket',
            bucket: 'kp-documents'
          }
        });
        
        if (funcError) {
          console.error('Edge function error:', funcError);
          return false;
        } else {
          console.log('Bucket created via edge function');
        }
      } else {
        console.log('Bucket created directly');
      }
    } else {
      console.log('kp-documents bucket already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    return false;
  }
};

export const uploadKpDocument = async (
  file: File,
  userId: string,
  documentType: string
): Promise<string | null> => {
  try {
    // Ensure bucket exists
    const bucketReady = await ensureKpDocumentsBucketExists();
    if (!bucketReady) {
      throw new Error('Storage bucket tidak tersedia');
    }

    // Create file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${documentType}/${Date.now()}.${fileExt}`;

    console.log('Uploading document to storage:', fileName);
    
    // Try direct upload first
    const { error: storageError, data } = await supabase
      .storage
      .from('kp-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      });
      
    if (storageError) {
      console.log('Direct upload failed, trying edge function:', storageError.message);
      
      // Fall back to edge function
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', fileName);
      formData.append('bucket', 'kp-documents');
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke('upload-file', {
        body: formData
      });
      
      if (functionError) {
        throw new Error(`Upload failed: ${functionError.message}`);
      }
      
      return functionData.publicUrl;
    }
    
    // Get public URL for successful direct upload
    const { data: { publicUrl } } = supabase
      .storage
      .from('kp-documents')
      .getPublicUrl(fileName);
    
    return publicUrl;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(`Storage error: ${error.message}`);
  }
};
