import { supabase } from '@/integrations/supabase/client';
import { fetchTeamSupervisors } from './supervisorService';
import { FeedbackEntry, Document, Proposal } from '@/types/supervisorProposals';
import { toast } from 'sonner';

// Fetch all proposals for a supervisor
export const fetchSupervisorProposals = async (userId: string): Promise<Proposal[]> => {
  try {
    // Get all teams where this supervisor is assigned
    const { data: supervisorTeams, error: teamsError } = await supabase
      .from('team_supervisors')
      .select('team_id')
      .eq('supervisor_id', userId);
      
    if (teamsError) {
      console.error("Error fetching supervisor teams:", teamsError);
      toast.error("Gagal memuat data tim");
      return [];
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
      .or(`supervisor_id.eq.${userId},team_id.in.(${teamIds.length > 0 ? teamIds.join(',') : 'null'})`)
      .order('created_at', { ascending: false });
      
    if (proposalsError) {
      console.error("Error fetching proposals:", proposalsError);
      toast.error("Gagal memuat data proposal");
      return [];
    }
    
    if (!proposalsData || proposalsData.length === 0) {
      return [];
    }
    
    // Process proposals
    const processedProposals: Proposal[] = [];
    
    for (const proposal of proposalsData) {
      const processedProposal = await processProposalData(proposal);
      processedProposals.push(processedProposal);
    }
    
    return processedProposals;
  } catch (error) {
    console.error("Error in fetchSupervisorProposals:", error);
    toast.error("Gagal memuat data proposal");
    return [];
  }
};

// Process a single proposal's data
const processProposalData = async (proposal: any): Promise<Proposal> => {
  // Get supervisors for this proposal
  let supervisors = [];
  if (proposal.team_id) {
    // Fetch team supervisors - including all supervisors assigned to the team
    supervisors = await fetchTeamSupervisors(proposal.team_id);
  }
  
  // Get documents
  const documents = await fetchProposalDocuments(proposal.id);
  
  // Get feedback
  const feedback = await fetchProposalFeedback(proposal.id);
  
  // Create a supervisorIds array from the supervisors
  const supervisorIds = supervisors.map(s => s.id);
  
  return {
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
    supervisors: supervisors, // Now contains all team supervisors
    documents: documents,
    feedback: feedback,
    supervisorIds: supervisorIds
  };
};

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

// Fetch feedback for a proposal
export const fetchProposalFeedback = async (proposalId: string): Promise<FeedbackEntry[]> => {
  try {
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('proposal_feedback')
      .select('id, content, created_at, supervisor_id')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: false });
      
    if (feedbackError) {
      console.error("Error fetching feedback:", feedbackError);
      return [];
    }
    
    const processedFeedback: FeedbackEntry[] = [];
    
    if (feedbackData && feedbackData.length > 0) {
      for (const fb of feedbackData) {
        // Get supervisor name with a separate query
        const { data: supervisorData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', fb.supervisor_id)
          .single();
        
        processedFeedback.push({
          id: fb.id,
          content: fb.content,
          createdAt: fb.created_at,
          supervisorName: supervisorData?.full_name || 'Unknown'
        });
      }
    }
    
    return processedFeedback;
  } catch (error) {
    console.error("Error in fetchProposalFeedback:", error);
    return [];
  }
};

// Send feedback for a proposal
export const sendProposalFeedback = async (
  proposalId: string,
  supervisorId: string,
  content: string
): Promise<boolean> => {
  if (!content.trim()) {
    toast.error('Feedback tidak boleh kosong');
    return false;
  }

  try {
    const { error } = await supabase
      .from('proposal_feedback')
      .insert({
        proposal_id: proposalId,
        supervisor_id: supervisorId,
        content: content.trim()
      });

    if (error) {
      console.error('Error saving feedback:', error);
      toast.error('Gagal menyimpan feedback');
      return false;
    }

    toast.success('Feedback berhasil disimpan');
    return true;
  } catch (error) {
    console.error('Error saving feedback:', error);
    toast.error('Gagal menyimpan feedback');
    return false;
  }
};
