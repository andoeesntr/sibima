
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { fetchTeamSupervisors } from '@/services/supervisorService';

export interface FeedbackEntry {
  id: string;
  content: string;
  createdAt: string;
  supervisorName: string;
}

export interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  submissionDate: string;
  status: string;
  studentName: string;
  studentId: string;
  rejectionReason?: string;
  teamName?: string;
  teamId?: string;
  companyName?: string;
  supervisors?: {
    id: string;
    full_name: string;
    profile_image?: string;
  }[];
  documents?: Document[];
  feedback?: FeedbackEntry[];
}

export const useSupervisorProposals = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [activeTab, setActiveTab] = useState('detail');

  // Fetch proposals for the supervisor
  useEffect(() => {
    const fetchProposals = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get all teams where this supervisor is assigned
        const { data: supervisorTeams, error: teamsError } = await supabase
          .from('team_supervisors')
          .select('team_id')
          .eq('supervisor_id', user.id);
          
        if (teamsError) {
          console.error("Error fetching supervisor teams:", teamsError);
          toast.error("Gagal memuat data tim");
          setLoading(false);
          return;
        }
        
        const teamIds = supervisorTeams?.map(team => team.team_id) || [];
        
        // Fetch proposals where:
        // 1. The supervisor is directly assigned as supervisor_id OR
        // 2. The proposal belongs to a team where the supervisor is assigned
        const { data: proposalsData, error: proposalsError } = await supabase
          .from('proposals')
          .select(`
            id, title, description, status, 
            created_at, company_name, team_id, rejection_reason, 
            student_id, supervisor_id,
            student:profiles!student_id (full_name),
            team:teams (id, name)
          `)
          .or(`supervisor_id.eq.${user.id},team_id.in.(${teamIds.length > 0 ? teamIds.join(',') : 'null'})`)
          .order('created_at', { ascending: false });
          
        if (proposalsError) {
          console.error("Error fetching proposals:", proposalsError);
          toast.error("Gagal memuat data proposal");
          setLoading(false);
          return;
        }
        
        if (!proposalsData || proposalsData.length === 0) {
          setProposals([]);
          setLoading(false);
          return;
        }
        
        // Process the proposals data
        const processedProposals: Proposal[] = [];
        
        for (const proposal of proposalsData) {
          // Get supervisors for this proposal
          let supervisors = [];
          if (proposal.team_id) {
            supervisors = await fetchTeamSupervisors(proposal.team_id);
          }
          
          // Get documents for this proposal
          const { data: documents, error: documentsError } = await supabase
            .from('proposal_documents')
            .select('id, file_name, file_url, file_type')
            .eq('proposal_id', proposal.id)
            .order('uploaded_at', { ascending: false });
            
          if (documentsError) {
            console.error("Error fetching documents:", documentsError);
          }
          
          // Get feedback for this proposal
          const { data: feedback, error: feedbackError } = await supabase
            .from('proposal_feedback')
            .select(`
              id, content, created_at, 
              supervisor:profiles!supervisor_id (full_name)
            `)
            .eq('proposal_id', proposal.id)
            .order('created_at', { ascending: false });
            
          if (feedbackError) {
            console.error("Error fetching feedback:", feedbackError);
          }
          
          const processedFeedback = feedback?.map(fb => ({
            id: fb.id,
            content: fb.content,
            createdAt: fb.created_at,
            supervisorName: fb.supervisor?.full_name || 'Unknown'
          })) || [];
          
          const processedDocuments = documents?.map(doc => ({
            id: doc.id,
            fileName: doc.file_name,
            fileUrl: doc.file_url,
            fileType: doc.file_type
          })) || [];
          
          processedProposals.push({
            id: proposal.id,
            title: proposal.title,
            description: proposal.description || '',
            submissionDate: proposal.created_at,
            status: proposal.status || 'submitted',
            studentName: proposal.student?.full_name || 'Unknown Student',
            studentId: proposal.student_id,
            rejectionReason: proposal.rejection_reason,
            teamName: proposal.team?.name,
            teamId: proposal.team_id,
            companyName: proposal.company_name,
            supervisors: supervisors,
            documents: processedDocuments,
            feedback: processedFeedback
          });
        }
        
        setProposals(processedProposals);
      } catch (error) {
        console.error("Error fetching proposals:", error);
        toast.error("Gagal memuat data proposal");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProposals();
  }, [user]);

  // Select a proposal by ID
  const selectProposal = (id: string) => {
    const proposal = proposals.find(p => p.id === id);
    setSelectedProposal(proposal || null);
    setActiveTab('detail');
  };

  return {
    proposals,
    loading,
    selectedProposal,
    setSelectedProposal,
    selectProposal,
    activeTab,
    setActiveTab
  };
};

export default useSupervisorProposals;
