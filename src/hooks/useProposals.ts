
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
  supervisors?: {
    id: string;
    full_name: string;
    profile_image?: string;
  }[];
  studentName?: string;
  student?: {
    nim?: string;
    full_name?: string;
  };
  companyName?: string;
  documentUrl?: string;
  teamId?: string;
  teamName?: string;
  documents?: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType?: string;
  }[];
  feedback?: {
    id: string;
    content: string;
    created_at: string;
    supervisor_id: string;
    supervisor_name?: string;
  }[];
  rejectionReason?: string;
}

export type ProposalStatus = 'submitted' | 'revision' | 'approved' | 'rejected' | 'all';

export const useProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      console.log('Fetching proposals...');

      // Fetch proposals with related data
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('proposals')
        .select(`
          id,
          title,
          description,
          status,
          created_at,
          company_name,
          rejection_reason,
          student_id,
          team_id,
          student:profiles!proposals_student_id_fkey (
            id,
            full_name,
            nim
          ),
          team:teams!proposals_team_id_fkey (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (proposalsError) {
        console.error('Error fetching proposals:', proposalsError);
        throw proposalsError;
      }

      console.log('Raw proposals data:', proposalsData);

      if (!proposalsData || proposalsData.length === 0) {
        console.log('No proposals found');
        setProposals([]);
        return;
      }

      // Transform the data to match our interface
      const transformedProposals: Proposal[] = proposalsData.map(proposal => {
        // Handle student data properly
        const studentData = proposal.student || { 
          id: proposal.student_id || '', 
          full_name: 'Unknown Student',
          nim: undefined
        };

        return {
          id: proposal.id,
          title: proposal.title || 'Untitled Proposal',
          description: proposal.description || '',
          status: proposal.status || 'submitted',
          submissionDate: proposal.created_at,
          studentName: studentData.full_name,
          student: {
            nim: studentData.nim,
            full_name: studentData.full_name
          },
          companyName: proposal.company_name,
          teamId: proposal.team_id,
          teamName: proposal.team?.name,
          rejectionReason: proposal.rejection_reason,
          supervisorIds: [], // Will be populated separately if needed
          documents: [],
          feedback: []
        };
      });

      console.log('Transformed proposals:', transformedProposals);
      setProposals(transformedProposals);

    } catch (error) {
      console.error('Error in fetchProposals:', error);
      toast.error('Gagal memuat daftar proposal');
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshProposals = () => {
    fetchProposals();
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return {
    proposals,
    loading,
    refreshProposals
  };
};
