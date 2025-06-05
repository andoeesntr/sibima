
import { supabase } from '@/integrations/supabase/client';

export const fetchProposalById = async (proposalId: string) => {
  try {
    console.log('Fetching proposal by ID:', proposalId);
    
    // Fetch the main proposal data with explicit column hints for relationships
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        id,
        title,
        description,
        company_name,
        status,
        created_at,
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
      .eq('id', proposalId)
      .single();

    if (proposalError) {
      console.error('Error fetching proposal:', proposalError);
      throw proposalError;
    }

    if (!proposal) {
      return null;
    }

    // Fetch team members if it's a team proposal
    let teamMembers = [];
    let teamData = null;
    
    if (proposal.team_id) {
      const { data: teamMembersData, error: teamMembersError } = await supabase
        .from('team_members')
        .select(`
          user_id,
          role,
          user:profiles!team_members_user_id_fkey (
            id,
            full_name,
            nim
          )
        `)
        .eq('team_id', proposal.team_id)
        .order('role', { ascending: false }); // leader first

      if (!teamMembersError && teamMembersData) {
        teamMembers = teamMembersData.map(member => ({
          id: member.user?.id || member.user_id,
          full_name: member.user?.full_name || 'Unknown',
          nim: member.user?.nim,
          role: member.role
        }));
      }

      // Structure team data with members
      if (proposal.team) {
        teamData = {
          id: proposal.team.id,
          name: proposal.team.name,
          members: teamMembers
        };
      }
    }

    // Fetch team supervisors
    let supervisors = [];
    if (proposal.team_id) {
      const { data: supervisorsData, error: supervisorsError } = await supabase
        .from('team_supervisors')
        .select(`
          supervisor:profiles!team_supervisors_supervisor_id_fkey (
            id,
            full_name,
            email,
            profile_image
          )
        `)
        .eq('team_id', proposal.team_id);

      if (!supervisorsError && supervisorsData) {
        supervisors = supervisorsData.map(item => item.supervisor).filter(Boolean);
      }
    }

    // Fetch proposal documents
    const { data: documents, error: documentsError } = await supabase
      .from('proposal_documents')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('uploaded_at', { ascending: false });

    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
    }

    // Fetch feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('proposal_feedback')
      .select(`
        id,
        content,
        created_at,
        supervisor_id,
        supervisor:profiles!proposal_feedback_supervisor_id_fkey (
          full_name
        )
      `)
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: false });

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError);
    }

    // Ensure student property has proper structure
    const studentData = proposal.student || { 
      id: proposal.student_id || '', 
      full_name: 'Unknown Student' 
    };

    const result = {
      ...proposal,
      student: studentData,
      team: teamData,
      supervisors,
      documents: documents || [],
      feedback: feedback || []
    };

    console.log('Successfully fetched proposal data:', result);
    return result;

  } catch (error) {
    console.error('Error in fetchProposalById:', error);
    throw error;
  }
};

export const fetchAllProposals = async () => {
  try {
    console.log('Fetching all proposals...');
    
    const { data: proposals, error } = await supabase
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

    if (error) {
      console.error('Error fetching proposals:', error);
      throw error;
    }

    console.log('Fetched proposals:', proposals);
    return proposals || [];
  } catch (error) {
    console.error('Error in fetchAllProposals:', error);
    throw error;
  }
};
