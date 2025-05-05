
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: string;
  submissionDate: string;
  reviewDate?: string;
  supervisorIds: string[];
  studentName?: string;
  companyName?: string;
  documentUrl?: string;
  documents?: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType?: string;
  }[];
}

export type ProposalStatus = 'submitted' | 'approved' | 'rejected' | 'all';

export const useProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      
      // Fetch proposals with student information
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          id, 
          title,
          description,
          status, 
          created_at,
          company_name,
          supervisor_id,
          student_id,
          student:profiles!student_id (full_name)
        `);
      
      if (error) {
        console.error("Error fetching proposals:", error);
        throw error;
      }

      console.log("Raw proposal data:", data);

      if (!data) {
        setProposals([]);
        return;
      }

      // Fetch documents for each proposal
      const proposalsWithDocuments = await Promise.all(
        data.map(async (proposal) => {
          const { data: documentData, error: documentError } = await supabase
            .from('proposal_documents')
            .select('id, file_name, file_url, file_type')
            .eq('proposal_id', proposal.id);
          
          if (documentError) {
            console.error(`Error fetching documents for proposal ${proposal.id}:`, documentError);
          }

          // Transform data for our component
          return {
            id: proposal.id,
            title: proposal.title,
            description: proposal.description || '',
            status: proposal.status || 'submitted',
            submissionDate: proposal.created_at,
            studentName: proposal.student?.full_name || 'Unknown Student',
            supervisorIds: proposal.supervisor_id ? [proposal.supervisor_id] : [],
            companyName: proposal.company_name,
            documents: documentData?.map(doc => ({
              id: doc.id,
              fileName: doc.file_name,
              fileUrl: doc.file_url,
              fileType: doc.file_type
            })) || []
          };
        })
      );
      
      setProposals(proposalsWithDocuments);
      console.log("Fetched proposals with documents:", proposalsWithDocuments);
    } catch (error: any) {
      console.error("Error fetching proposals:", error);
      toast.error("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return {
    proposals,
    loading,
    fetchProposals
  };
};
