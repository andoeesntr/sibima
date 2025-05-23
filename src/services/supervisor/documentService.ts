
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/supervisorProposals';

// Fetch documents for a proposal
export const fetchProposalDocuments = async (proposalId: string): Promise<Document[]> => {
  try {
    const { data: documents, error: documentsError } = await supabase
      .from('proposal_documents')
      .select('id, file_name, file_url, file_type')
      .eq('proposal_id', proposalId)
      .order('uploaded_at', { ascending: false });
      
    if (documentsError) {
      console.error("Error fetching documents:", documentsError);
      return [];
    }
    
    return documents?.map(doc => ({
      id: doc.id,
      fileName: doc.file_name,
      fileUrl: doc.file_url,
      fileType: doc.file_type
    })) || [];
  } catch (error) {
    console.error("Error in fetchProposalDocuments:", error);
    return [];
  }
};
