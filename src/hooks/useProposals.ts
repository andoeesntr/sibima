
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  fetchProposalsList, 
  fetchProposalDocuments, 
  fetchSupervisorName, 
  fetchTeamSupervisors, 
  fetchMainSupervisor,
  saveProposalFeedback
} from '@/services/proposalService';

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
      const rawProposals = await fetchProposalsList();
      
      const transformedProposals: Proposal[] = await Promise.all(rawProposals.map(async (rawProposal: any) => {
        // Fetch documents
        const documents = await fetchProposalDocuments(rawProposal.id);
        
        // Fetch team supervisors
        let supervisors: any[] = [];
        if (rawProposal.team?.id) {
          supervisors = await fetchTeamSupervisors(rawProposal.team.id);
        } else if (rawProposal.supervisor_id) {
          supervisors = await fetchMainSupervisor(rawProposal.supervisor_id);
        }
        
        return {
          id: rawProposal.id,
          title: rawProposal.title,
          description: rawProposal.description || '',
          status: rawProposal.status,
          submissionDate: rawProposal.created_at,
          supervisorIds: supervisors.map(s => s.id) || [],
          supervisors: supervisors || [],
          studentName: rawProposal.student?.full_name,
          student: rawProposal.student,
          companyName: rawProposal.company_name,
          teamId: rawProposal.team?.id,
          teamName: rawProposal.team?.name,
          documents: documents.map((doc: any) => ({
            id: doc.id,
            fileName: doc.file_name,
            fileUrl: doc.file_url,
            fileType: doc.file_type
          })),
          rejectionReason: rawProposal.rejection_reason
        };
      }));
      
      setProposals(transformedProposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast.error("Gagal memuat daftar proposal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const refreshProposals = () => {
    fetchProposals();
  };

  // Method to save feedback directly from this hook
  const saveFeedback = async (proposalId: string, supervisorId: string, content: string) => {
    try {
      await saveProposalFeedback(proposalId, supervisorId, content);
      // After saving feedback, refresh the proposals list
      await fetchProposals();
      return true;
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }
  };

  return { 
    proposals, 
    loading, 
    refreshProposals,
    saveFeedback
  };
};
