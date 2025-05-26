
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createProposalsForAllTeamMembers, saveDocumentToAllTeamProposals } from '@/services/proposalService';

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

    // Create proposals for all team members (NEW APPROACH)
    let createdProposals: any[] = [];
    let mainProposalId = proposalId;

    if (isEditMode && proposalId) {
      // Update existing proposal
      const { error: updateError } = await supabase
        .from('proposals')
        .update({
          title,
          description,
          company_name: companyName,
          status: 'submitted'
        })
        .eq('id', proposalId);

      if (updateError) throw updateError;
      mainProposalId = proposalId;
    } else {
      // Create proposals for ALL team members
      const proposalData = {
        title,
        description,
        company_name: companyName,
        status: 'submitted'
      };

      createdProposals = await createProposalsForAllTeamMembers(
        teamId,
        teamMembers,
        proposalData
      );

      // Use the first created proposal as the main one (usually the submitter's)
      const submitterProposal = createdProposals.find(p => p.student_id === user.id);
      mainProposalId = submitterProposal?.id || createdProposals[0]?.id;
    }

    // Handle file upload - save to all team proposals
    if (file && mainProposalId) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `proposals/${mainProposalId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Save document to all team members' proposals
      if (!isEditMode) {
        await saveDocumentToAllTeamProposals(
          mainProposalId,
          publicUrl,
          file.name,
          file.type,
          user.id
        );
      } else {
        // For edit mode, just save to the current proposal
        const { error: docError } = await supabase
          .from('proposal_documents')
          .insert({
            proposal_id: mainProposalId,
            file_name: file.name,
            file_url: publicUrl,
            file_type: file.type,
            uploaded_by: user.id
          });

        if (docError) throw docError;
      }
    }

    console.log(`Successfully handled proposal submission. Created ${createdProposals.length} proposals for team members.`);
    return { success: true };
  } catch (error) {
    console.error('Submission error:', error);
    throw error;
  }
};
