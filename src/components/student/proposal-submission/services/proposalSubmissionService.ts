
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubmissionData {
  user: any;
  profile: any;
  isEditMode: boolean;
  proposalId: string | null;
  existingTeamId: string | null;
  existingDocumentId: string | null;
  title: string;
  description: string;
  teamName: string;
  companyName: string;
  teamMembers: any[];
  selectedSupervisors: string[];
  file: File | null;
}

export const handleProposalSubmission = async (data: SubmissionData) => {
  const {
    user,
    profile,
    isEditMode,
    proposalId,
    existingTeamId,
    existingDocumentId,
    title,
    description,
    teamName,
    companyName,
    teamMembers,
    selectedSupervisors,
    file
  } = data;

  let teamId = existingTeamId;

  try {
    // Create or update team
    if (!teamId) {
      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({ name: teamName })
        .select()
        .single();

      if (teamError) throw teamError;
      teamId = newTeam.id;

      // Add team members - IMPORTANT: Add the current user as leader FIRST
      const teamMemberInserts = teamMembers.map(member => ({
        team_id: teamId,
        user_id: member.id,
        role: member.id === user.id ? 'leader' : 'member'
      }));

      console.log('Inserting team members:', teamMemberInserts);

      const { error: membersError } = await supabase
        .from('team_members')
        .insert(teamMemberInserts);

      if (membersError) {
        console.error('Error inserting team members:', membersError);
        throw membersError;
      }

      console.log('Successfully created team members');
    }

    // Handle team supervisors - this is the key fix
    if (teamId && selectedSupervisors && selectedSupervisors.length > 0) {
      console.log('Saving supervisors for team:', teamId, selectedSupervisors);
      
      // First, remove existing supervisors if this is an edit
      if (isEditMode) {
        const { error: deleteError } = await supabase
          .from('team_supervisors')
          .delete()
          .eq('team_id', teamId);
        
        if (deleteError) {
          console.error('Error deleting existing supervisors:', deleteError);
        }
      }

      // Insert all selected supervisors
      const supervisorInserts = selectedSupervisors.map(supervisorId => ({
        team_id: teamId,
        supervisor_id: supervisorId
      }));

      console.log('Inserting supervisors:', supervisorInserts);

      const { error: supervisorsError } = await supabase
        .from('team_supervisors')
        .insert(supervisorInserts);

      if (supervisorsError) {
        console.error('Error inserting supervisors:', supervisorsError);
        throw supervisorsError;
      }

      console.log('Successfully saved all supervisors');
    }

    // Create or update proposal
    const proposalData = {
      student_id: user.id,
      title,
      description,
      company_name: companyName,
      team_id: teamId,
      status: 'submitted'
    };

    let finalProposalId = proposalId;

    if (isEditMode && proposalId) {
      const { error: updateError } = await supabase
        .from('proposals')
        .update(proposalData)
        .eq('id', proposalId);

      if (updateError) throw updateError;
    } else {
      const { data: newProposal, error: proposalError } = await supabase
        .from('proposals')
        .insert(proposalData)
        .select()
        .single();

      if (proposalError) throw proposalError;
      finalProposalId = newProposal.id;
    }

    // Handle file upload
    if (file && finalProposalId) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `proposals/${finalProposalId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const { error: docError } = await supabase
        .from('proposal_documents')
        .insert({
          proposal_id: finalProposalId,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          uploaded_by: user.id
        });

      if (docError) throw docError;
    }

    return { success: true };
  } catch (error) {
    console.error('Submission error:', error);
    throw error;
  }
};
