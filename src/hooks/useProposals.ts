
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
  documentUrl?: string;
}

export type ProposalStatus = 'submitted' | 'approved' | 'rejected' | 'all';

export const useProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      
      // Check database structure first
      const { data: checkData, error: checkError } = await supabase
        .from('proposals')
        .select('*')
        .limit(1);
      
      if (checkError) {
        console.error("Error checking table structure:", checkError);
        throw checkError;
      }
      
      console.log("Table structure sample:", checkData);

      // Fetch proposals with student information
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          id, 
          title,
          description,
          status, 
          created_at,
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

      // Transform data for our component
      const formattedProposals: Proposal[] = data.map(proposal => ({
        id: proposal.id,
        title: proposal.title,
        description: proposal.description || '',
        status: proposal.status || 'submitted',
        submissionDate: proposal.created_at,
        studentName: proposal.student?.full_name || 'Unknown Student',
        supervisorIds: proposal.supervisor_id ? [proposal.supervisor_id] : [],
        // Since we don't have a separate table for documents yet, we'll use a placeholder
        // In the future, you can store document URLs in the proposals table directly or create a new table
      }));
      
      setProposals(formattedProposals);
      console.log("Fetched proposals:", formattedProposals);
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
