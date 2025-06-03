
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  full_name: string;
  nim?: string;
}

export async function fetchExistingProposal(proposalId: string) {
  try {
    // Fetch proposal details
    const { data: proposalData, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        id, title, description, company_name, team_id, supervisor_id, 
        team:team_id (id, name)
      `)
      .eq('id', proposalId)
      .single();

    if (proposalError) {
      throw proposalError;
    }

    if (!proposalData) {
      return null;
    }

    // Fetch team members
    let teamMembers: Student[] = [];
    if (proposalData.team_id) {
      const { data: teamMembersData, error: teamMembersError } = await supabase
        .from('team_members')
        .select(`
          user_id,
          user:user_id (id, full_name, nim)
        `)
        .eq('team_id', proposalData.team_id);
          
      if (!teamMembersError && teamMembersData) {
        teamMembers = teamMembersData.map(item => ({
          id: item.user?.id || item.user_id,
          full_name: item.user?.full_name || 'Unknown',
          nim: item.user?.nim
        }));
      }
    }
    
    // Fetch team supervisors
    let supervisorIds: string[] = [];
    if (proposalData.team_id) {
      const { data: teamSupervisorsData, error: teamSupervisorsError } = await supabase
        .from('team_supervisors')
        .select('supervisor_id')
        .eq('team_id', proposalData.team_id);
          
      if (!teamSupervisorsError && teamSupervisorsData) {
        supervisorIds = teamSupervisorsData.map(item => item.supervisor_id);
      }
    }
    
    // Fetch proposal documents
    let documentId = null;
    const { data: documentData, error: documentError } = await supabase
      .from('proposal_documents')
      .select('id, file_name')
      .eq('proposal_id', proposalId)
      .order('uploaded_at', { ascending: false })
      .limit(1);
        
    if (!documentError && documentData && documentData.length > 0) {
      documentId = documentData[0].id;
    }
    
    return {
      ...proposalData,
      teamMembers,
      supervisorIds,
      documentId
    };
  } catch (error) {
    console.error('Error fetching proposal data:', error);
    throw error;
  }
}
