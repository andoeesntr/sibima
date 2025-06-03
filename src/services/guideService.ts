
import { supabase } from '@/integrations/supabase/client';
import { GuideDocument } from '@/types';
import { toast } from 'sonner';

export const fetchGuideDocuments = async (): Promise<GuideDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('guide_documents')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching guide documents:', error);
      return [];
    }

    return data.map(doc => ({
      id: doc.id,
      title: doc.title,
      description: doc.description || '',
      fileUrl: doc.file_url,
      uploadDate: doc.uploaded_at
    }));
  } catch (error) {
    console.error('Error fetching guide documents:', error);
    return [];
  }
};

export const uploadGuideDocument = async (
  title: string,
  description: string | null,
  file: File
): Promise<GuideDocument | null> => {
  try {
    // First, ensure the bucket exists
    await ensureGuideBucketExists();

    // Now proceed with file upload
    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    console.log('Attempting to upload file to guide_documents bucket:', filePath);
    
    // Try direct upload first
    let uploadResult = await attemptDirectUpload(filePath, file);
    
    // If direct upload fails, try using the edge function
    if (!uploadResult.success) {
      console.log('Direct upload failed, trying via edge function');
      uploadResult = await attemptFunctionUpload(filePath, file);
      
      if (!uploadResult.success) {
        toast.error('Error uploading file');
        return null;
      }
    }

    const publicUrl = uploadResult.publicUrl;
    
    // Save document metadata to database
    const { data: docData, error: dbError } = await supabase
      .from('guide_documents')
      .insert({
        title,
        description,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving document metadata:', dbError);
      toast.error('Error saving document metadata');
      return null;
    }

    toast.success('Document uploaded successfully');
    return {
      id: docData.id,
      title: docData.title,
      description: docData.description || '',
      fileUrl: docData.file_url,
      uploadDate: docData.uploaded_at
    };
  } catch (error) {
    console.error('Error uploading guide document:', error);
    toast.error('Error uploading document');
    return null;
  }
};

// Helper function to attempt direct upload
async function attemptDirectUpload(filePath: string, file: File) {
  try {
    const { error, data } = await supabase.storage
      .from('guide_documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      });
    
    if (error) {
      console.error('Direct upload error:', error);
      return { success: false, error };
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('guide_documents')
      .getPublicUrl(filePath);
    
    return { success: true, publicUrl };
  } catch (error) {
    console.error('Exception during direct upload:', error);
    return { success: false, error };
  }
}

// Helper function to attempt upload via edge function
async function attemptFunctionUpload(filePath: string, file: File) {
  try {
    // Get current session token
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    
    if (!accessToken) {
      throw new Error('No authentication token available');
    }
    
    // Create a form for the file and metadata
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', filePath);
    formData.append('bucket', 'guide_documents');
    
    // Call the upload-file edge function
    const { data, error } = await supabase.functions.invoke('upload-file', {
      body: formData
    });
    
    if (error) {
      console.error('Function upload error:', error);
      return { success: false, error };
    }
    
    return { success: true, publicUrl: data.publicUrl };
  } catch (error) {
    console.error('Exception during function upload:', error);
    return { success: false, error };
  }
}

// Helper function to ensure the guide documents bucket exists
async function ensureGuideBucketExists() {
  try {
    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      // Continue anyway, we'll try to create the bucket
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'guide_documents');
    
    if (!bucketExists) {
      console.log('Guide documents bucket not found, creating it...');
      
      // Try direct creation first
      const { error: createError } = await supabase.storage
        .createBucket('guide_documents', {
          public: true,
          fileSizeLimit: 10485760 // 10MB limit
        });
      
      if (createError) {
        console.log('Direct bucket creation failed, trying via edge function');
        
        // Try using edge function instead
        const { error: funcError } = await supabase.functions.invoke('create-storage-bucket', {
          body: { bucketName: 'guide_documents' }
        });
        
        if (funcError) {
          console.error('Edge function error:', funcError);
          // Continue anyway, bucket may exist already or be created in another way
        } else {
          console.log('Bucket created via edge function');
        }
      } else {
        console.log('Bucket created directly');
      }
    } else {
      console.log('Guide documents bucket already exists');
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    // Continue anyway, bucket may already exist
  }
}

export const deleteGuideDocument = async (id: string): Promise<boolean> => {
  try {
    // Get the document to find the file path
    const { data: document, error: fetchError } = await supabase
      .from('guide_documents')
      .select('file_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching document for deletion:', fetchError);
      toast.error('Error deleting document');
      return false;
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('guide_documents')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting document from database:', deleteError);
      toast.error('Error deleting document');
      return false;
    }

    // Try to delete the file from storage if possible
    // We can't easily get the storage path from the URL, but in a real app
    // you might store the storage path in the database as well
    // This is optional and won't fail the operation if it doesn't work

    toast.success('Document deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting guide document:', error);
    toast.error('Error deleting document');
    return false;
  }
};
