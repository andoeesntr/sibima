
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  full_name: string;
  nim?: string;
}

interface SubmissionParams {
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
  teamMembers: Student[];
  selectedSupervisors: string[];
  file: File | null;
}

export async function handleProposalSubmission({
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
}: SubmissionParams) {
  try {
    let teamId = existingTeamId;
    
    // If editing and team exists, update team
    if (isEditMode && existingTeamId) {
      // Update team name if changed
      const { error: teamUpdateError } = await supabase
        .from('teams')
        .update({ name: teamName, updated_at: new Date().toISOString() })
        .eq('id', existingTeamId);
        
      if (teamUpdateError) {
        throw teamUpdateError;
      }
    } else {
      // Create team if doesn't exist
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({ name: teamName })
        .select('id')
        .single();

      if (teamError) {
        throw teamError;
      }
      
      teamId = teamData.id;
      
      // Add team members
      const teamMembersToInsert = teamMembers.map(member => ({
        team_id: teamData.id,
        user_id: member.id,
        role: member.id === user.id ? 'leader' : 'member'
      }));

      const { error: memberError } = await supabase
        .from('team_members')
        .insert(teamMembersToInsert);

      if (memberError) {
        throw memberError;
      }
    }

    let finalProposalId = proposalId;
    
    if (isEditMode && proposalId) {
      // Update existing proposal
      const { error: proposalUpdateError } = await supabase
        .from('proposals')
        .update({
          title,
          description,
          company_name: companyName,
          supervisor_id: selectedSupervisors[0],
          status: 'submitted', // Reset to submitted after revision
          rejection_reason: null, // Clear previous rejection reason
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId);
        
      if (proposalUpdateError) {
        throw proposalUpdateError;
      }
    } else {
      // Create new proposal
      const { data: proposalData, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          student_id: user.id,
          title,
          description,
          company_name: companyName,
          supervisor_id: selectedSupervisors[0],
          status: 'submitted',
          team_id: teamId
        })
        .select();

      if (proposalError) {
        throw proposalError;
      }
      
      finalProposalId = proposalData[0].id;
    }

    // Upload new file if provided
    if (file && finalProposalId) {
      await handleFileUpload(file, user.id, finalProposalId, existingDocumentId);
    }

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      user_name: profile.full_name || user.email,
      action: isEditMode ? 'revised' : 'submitted',
      target_type: 'proposal',
      target_id: finalProposalId
    });

    return finalProposalId;
  } catch (error) {
    console.error('Error in proposal submission:', error);
    throw error;
  }
}

async function handleFileUpload(file: File, userId: string, proposalId: string, existingDocumentId: string | null) {
  const fileName = `${Date.now()}_${file.name}`;
  const fileExt = fileName.split('.').pop();
  const filePath = `${userId}/${proposalId}/${fileName}`;

  try {
    // If we're in edit mode and have existing documents, delete all of them
    if (existingDocumentId) {
      // Get all documents for this proposal
      const { data: existingDocs, error: fetchError } = await supabase
        .from('proposal_documents')
        .select('id, file_url')
        .eq('proposal_id', proposalId);
      
      if (!fetchError && existingDocs && existingDocs.length > 0) {
        console.log(`Found ${existingDocs.length} existing documents to clean up`);
        
        // Delete each document from storage
        for (const doc of existingDocs) {
          try {
            const url = new URL(doc.file_url);
            const storagePath = url.pathname.split('/').slice(3).join('/');
            
            const { error: storageDeleteError } = await supabase.storage
              .from('proposal-documents')
              .remove([storagePath]);
              
            if (storageDeleteError) {
              console.error("Error deleting file from storage:", storageDeleteError);
            } else {
              console.log(`Successfully deleted file from storage: ${storagePath}`);
            }
          } catch (e) {
            console.error("Error parsing file URL:", e);
          }
        }
        
        // Delete all document records from database
        const { error: deleteError } = await supabase
          .from('proposal_documents')
          .delete()
          .eq('proposal_id', proposalId);

        if (deleteError) {
          console.error("Error deleting old document records:", deleteError);
        } else {
          console.log(`Successfully deleted ${existingDocs.length} document records`);
        }
      } else if (fetchError) {
        console.error("Error fetching existing documents:", fetchError);
      }
    }

    // Upload the new file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('proposal-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL for the uploaded file
    const { data: publicURLData } = supabase.storage
      .from('proposal-documents')
      .getPublicUrl(filePath);

    if (!publicURLData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }

    // Add document record in the database
    const { error: documentError } = await supabase
      .from('proposal_documents')
      .insert({
        proposal_id: proposalId,
        file_name: fileName,
        file_url: publicURLData.publicUrl,
        file_type: fileExt,
        uploaded_by: userId
      });

    if (documentError) {
      throw documentError;
    }

    return publicURLData.publicUrl;
  } catch (error) {
    console.error("Error in handleFileUpload:", error);
    throw error;
  }
}
