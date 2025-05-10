
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { fetchTeamSupervisors, fetchMainSupervisor, Supervisor } from '@/services/supervisorService';

interface Proposal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  company_name: string | null;
  created_at: string;
  updated_at: string | null;
  rejection_reason?: string;
  supervisor_id?: string | null;
  team_id?: string | null;
}

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

interface UseProposalDetailResult {
  proposal: Proposal | null;
  loading: boolean;
  attachments: Attachment[];
  supervisors: Supervisor[];
  previewUrl: string | null;
  previewName: string;
  previewDialogOpen: boolean;
  setPreviewDialogOpen: (open: boolean) => void;
  handlePreview: (url: string, name: string) => void;
}

export const useProposalDetail = (proposalId: string | undefined): UseProposalDetailResult => {
  const { user } = useAuth();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewName, setPreviewName] = useState('');

  useEffect(() => {
    const fetchProposal = async () => {
      if (!user || !proposalId) return;

      setLoading(true);
      try {
        const { data: proposalData, error: proposalError } = await supabase
          .from('proposals')
          .select(`
            id,
            title,
            description,
            status,
            company_name,
            created_at,
            updated_at,
            supervisor_id,
            team_id,
            rejection_reason
          `)
          .eq('id', proposalId)
          .eq('student_id', user.id)
          .single();

        if (proposalError) {
          console.error('Error fetching proposal:', proposalError);
          toast.error('Gagal memuat data proposal');
          return;
        }

        // Fetch supervisors - prioritize team supervisors
        let fetchedSupervisors: Supervisor[] = [];
        if (proposalData.team_id) {
          fetchedSupervisors = await fetchTeamSupervisors(proposalData.team_id);
          console.log('Team supervisors:', fetchedSupervisors);
        }
        
        // If no team supervisors found, use the main supervisor as fallback
        if (fetchedSupervisors.length === 0 && proposalData.supervisor_id) {
          const mainSupervisor = await fetchMainSupervisor(proposalData.supervisor_id);
          fetchedSupervisors = mainSupervisor;
          console.log('Main supervisor:', fetchedSupervisors);
        }

        setSupervisors(fetchedSupervisors);

        // Fetch documents
        const { data: documentData, error: documentError } = await supabase
          .from('proposal_documents')
          .select('id, file_name, file_url, file_type, uploaded_at')
          .eq('proposal_id', proposalId);

        if (documentError) {
          console.error('Error fetching documents:', documentError);
        }

        setProposal(proposalData);
        setAttachments(documentData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [proposalId, user]);

  const handlePreview = (url: string, name: string) => {
    setPreviewUrl(url);
    setPreviewName(name);
    setPreviewDialogOpen(true);
  };

  return {
    proposal,
    loading,
    attachments,
    supervisors,
    previewUrl,
    previewName,
    previewDialogOpen,
    setPreviewDialogOpen,
    handlePreview
  };
};
