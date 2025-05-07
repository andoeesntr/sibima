
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
    // First, check if the guide_documents bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'guide_documents');
    
    // If bucket doesn't exist, try to create it
    if (!bucketExists) {
      try {
        // Try direct bucket creation first
        const { error: createBucketError } = await supabase.storage.createBucket('guide_documents', {
          public: true,
          fileSizeLimit: 10485760 // 10MB limit
        });
        
        if (createBucketError) {
          console.log('Direct bucket creation failed, trying via edge function');
          
          // Try using edge function as fallback
          const { error: functionError } = await supabase.functions.invoke('create-storage-bucket', {
            body: { bucketName: 'guide_documents' }
          });
          
          if (functionError) {
            console.error('Edge function error:', functionError);
            // Continue anyway - we'll attempt the upload
          }
        }
      } catch (bucketError) {
        console.warn('Error creating bucket:', bucketError);
        // Continue anyway - we'll attempt to upload to the bucket
      }
    }

    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('guide_documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast.error('Error uploading file');
      return null;
    }

    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('guide_documents')
      .getPublicUrl(filePath);

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
