
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function fetchProposalFeedback(proposalId: string) {
  try {
    const { data: feedback, error } = await supabase
      .from('proposal_feedback')
      .select(`
        id, content, created_at,
        supervisor:profiles!supervisor_id(full_name)
      `)
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      return [];
    }

    // Transform the data to match FeedbackEntry interface
    return (feedback || []).map(item => ({
      id: item.id,
      content: item.content,
      createdAt: item.created_at,
      supervisorName: item.supervisor?.full_name || 'Unknown Supervisor'
    }));
  } catch (error) {
    console.error('Error in fetchProposalFeedback:', error);
    return [];
  }
}

export async function sendProposalFeedback(
  proposalId: string,
  supervisorId: string,
  feedback: string
): Promise<boolean> {
  try {
    console.log('Sending feedback for proposal:', proposalId);
    
    if (!feedback.trim()) {
      toast.error('Feedback tidak boleh kosong');
      return false;
    }

    // Save the feedback
    const { error: feedbackError } = await supabase
      .from('proposal_feedback')
      .insert({
        proposal_id: proposalId,
        supervisor_id: supervisorId,
        content: feedback.trim()
      });

    if (feedbackError) {
      console.error('Error saving feedback:', feedbackError);
      throw feedbackError;
    }

    // Get proposal info for team sync
    const { data: proposal, error: proposalFetchError } = await supabase
      .from('proposals')
      .select('team_id, student_id, title, profiles!student_id(full_name)')
      .eq('id', proposalId)
      .single();

    if (proposalFetchError) {
      console.error('Error fetching proposal for team sync:', proposalFetchError);
      // Don't fail the whole operation for this
    }

    // If the proposal is part of a team, sync the feedback to all team members' proposals
    if (proposal?.team_id) {
      console.log('Syncing feedback to team members for team:', proposal.team_id);
      
      // Get all team members
      const { data: teamMembers, error: teamMembersError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', proposal.team_id);

      if (teamMembersError) {
        console.error('Error getting team members:', teamMembersError);
      } else if (teamMembers && teamMembers.length > 0) {
        // Get all proposals for these team members (excluding the current one)
        const memberIds = teamMembers.map(member => member.user_id);
        
        const { data: teamProposals, error: teamProposalsError } = await supabase
          .from('proposals')
          .select('id')
          .in('student_id', memberIds)
          .eq('team_id', proposal.team_id)
          .neq('id', proposalId);

        if (teamProposalsError) {
          console.error('Error fetching team proposals:', teamProposalsError);
        } else if (teamProposals && teamProposals.length > 0) {
          // Create feedback entries for all other team members' proposals
          const feedbackEntries = teamProposals.map(teamProposal => ({
            proposal_id: teamProposal.id,
            supervisor_id: supervisorId,
            content: feedback.trim()
          }));
          
          const { error: insertError } = await supabase
            .from('proposal_feedback')
            .insert(feedbackEntries);

          if (insertError) {
            console.error("Error syncing feedback with team:", insertError);
            // Don't fail the operation for team sync issues
          } else {
            console.log("Successfully synced feedback to all team members");
          }
        }
      }
    }

    console.log('Feedback sent successfully');
    toast.success('Feedback berhasil dikirim');
    return true;
  } catch (error: any) {
    console.error('Error sending feedback:', error);
    const errorMessage = error.message || 'Gagal mengirim feedback';
    toast.error(errorMessage);
    return false;
  }
}
