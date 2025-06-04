
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  full_name: string;
  nim?: string;
}

interface ProposalData {
  title: string;
  description: string;
  company_name: string;
  status: string;
}

// Fetch proposals list for supervisor/coordinator view
export const fetchProposalsList = async () => {
  const { data, error } = await supabase
    .from('proposals')
    .select(`
      id,
      title,
      description,
      status,
      company_name,
      created_at,
      rejection_reason,
      student:student_id (
        id,
        full_name,
        nim
      ),
      team:team_id (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Fetch proposal documents
export const fetchProposalDocuments = async (proposalId: string) => {
  const { data, error } = await supabase
    .from('proposal_documents')
    .select('*')
    .eq('proposal_id', proposalId)
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Fetch team supervisors
export const fetchTeamSupervisors = async (teamId: string) => {
  const { data, error } = await supabase
    .from('team_supervisors')
    .select(`
      supervisor:supervisor_id (
        id,
        full_name,
        profile_image
      )
    `)
    .eq('team_id', teamId);

  if (error) throw error;
  return data?.map(item => item.supervisor).filter(Boolean) || [];
};

// Fetch main supervisor
export const fetchMainSupervisor = async (supervisorId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, profile_image')
    .eq('id', supervisorId)
    .single();

  if (error) throw error;
  return data ? [data] : [];
};

// Fetch supervisor name
export const fetchSupervisorName = async (supervisorId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', supervisorId)
    .single();

  if (error) throw error;
  return data?.full_name || 'Unknown Supervisor';
};

// Save proposal feedback
export const saveProposalFeedback = async (proposalId: string, supervisorId: string, content: string) => {
  const { error } = await supabase
    .from('proposal_feedback')
    .insert({
      proposal_id: proposalId,
      supervisor_id: supervisorId,
      content: content
    });

  if (error) throw error;
};

// Create proposals for all team members
export const createProposalsForAllTeamMembers = async (
  teamId: string,
  teamMembers: Student[],
  proposalData: ProposalData
) => {
  console.log('Creating proposals for team members:', teamMembers.length);
  
  const proposalInserts = teamMembers.map(member => ({
    student_id: member.id,
    team_id: teamId,
    title: proposalData.title,
    description: proposalData.description,
    company_name: proposalData.company_name,
    status: proposalData.status
  }));

  const { data, error } = await supabase
    .from('proposals')
    .insert(proposalInserts)
    .select();

  if (error) {
    console.error('Error creating team proposals:', error);
    throw error;
  }

  console.log(`Successfully created ${data.length} proposals for team members`);
  return data;
};

// Save document to all team proposals
export const saveDocumentToAllTeamProposals = async (
  proposalId: string,
  fileUrl: string,
  fileName: string,
  fileType: string,
  uploadedBy: string
) => {
  console.log('Saving document to all team proposals for proposal:', proposalId);

  // First, get the team_id from the proposal
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select('team_id')
    .eq('id', proposalId)
    .single();

  if (proposalError || !proposal?.team_id) {
    console.error('Error fetching proposal team:', proposalError);
    // Fallback: save to just this proposal
    const { error } = await supabase
      .from('proposal_documents')
      .insert({
        proposal_id: proposalId,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        uploaded_by: uploadedBy
      });

    if (error) throw error;
    return;
  }

  // Get all proposals for this team
  const { data: teamProposals, error: teamProposalsError } = await supabase
    .from('proposals')
    .select('id')
    .eq('team_id', proposal.team_id);

  if (teamProposalsError) {
    console.error('Error fetching team proposals:', teamProposalsError);
    throw teamProposalsError;
  }

  // Create document entries for all team proposals
  const documentInserts = teamProposals.map(teamProposal => ({
    proposal_id: teamProposal.id,
    file_url: fileUrl,
    file_name: fileName,
    file_type: fileType,
    uploaded_by: uploadedBy
  }));

  const { error: documentsError } = await supabase
    .from('proposal_documents')
    .insert(documentInserts);

  if (documentsError) {
    console.error('Error saving documents to team proposals:', documentsError);
    throw documentsError;
  }

  console.log(`Successfully saved document to ${teamProposals.length} team proposals`);
};
