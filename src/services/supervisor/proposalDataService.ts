
import { supabase } from '@/integrations/supabase/client';
import { fetchTeamSupervisors } from '../supervisorService';
import { FeedbackEntry, Document, Proposal } from '@/types/supervisorProposals';
import { fetchProposalDocuments } from './documentService';
import { fetchProposalFeedback } from './feedbackService';

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
    return [];
  }
};

// Process a single proposal's data
export const processProposalData = async (proposal: any): Promise<Proposal> => {
  // Get supervisors for this proposal
  let supervisors = [];
  if (proposal.team_id) {
    // Fetch team supervisors - including all supervisors assigned to the team
    supervisors = await fetchTeamSupervisors(proposal.team_id);
  }
  
  // Get documents and feedback
  const documents = await fetchProposalDocuments(proposal.id);
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
