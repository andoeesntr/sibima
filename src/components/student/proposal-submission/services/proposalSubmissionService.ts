
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

      // Ensure the current user is the first member (team leader)
      // This is critical for maintaining the submitter as the first member
      const currentUserMember = teamMembers.find(member => member.id === user.id);
      const otherMembers = teamMembers.filter(member => member.id !== user.id);
      
      let orderedTeamMembers;
      if (currentUserMember) {
        // Current user exists in team members, put them first
        orderedTeamMembers = [currentUserMember, ...otherMembers];
      } else {
        // Current user not in team members (shouldn't happen, but as failsafe)
        console.error('Current user not found in team members, adding them as leader');
        const currentUserProfile = {
          id: user.id,
          full_name: profile.full_name || 'Unknown User',
          nim: profile.nim
        };
        orderedTeamMembers = [currentUserProfile, ...teamMembers];
      }

      // Add team members with current user as leader FIRST
      const teamMemberInserts = orderedTeamMembers.map((member, index) => ({
        team_id: teamId,
        user_id: member.id,
        role: index === 0 ? 'leader' : 'member' // First member is always leader (submitter)
      }));

      console.log('Inserting team members with leader first:', teamMemberInserts);

      const { error: membersError } = await supabase
        .from('team_members')
        .insert(teamMemberInserts);

      if (membersError) {
        console.error('Error inserting team members:', membersError);
        throw membersError;
      }

      console.log('Successfully created team members with current user as leader');
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

      // Ensure ordered team members for proposal creation
      const currentUserMember = teamMembers.find(member => member.id === user.id);
      const otherMembers = teamMembers.filter(member => member.id !== user.id);
      const orderedMembersForProposal = currentUserMember ? [currentUserMember, ...otherMembers] : teamMembers;

      // Fixed function call with correct parameters
      createdProposals = await createProposalsForAllTeamMembers(
        teamId,
        orderedMembersForProposal,
        proposalData
      );

      // Use the submitter's proposal as the main one (should be first)
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

      // Fixed function call with correct parameters
      await saveDocumentToAllTeamProposals(
        mainProposalId,
        publicUrl,
        file.name,
        file.type,
        user.id
      );
    }

    console.log(`Successfully handled proposal submission. Created ${createdProposals.length} proposals for team members.`);
    return { success: true };
  } catch (error) {
    console.error('Submission error:', error);
    throw error;
  }
};
