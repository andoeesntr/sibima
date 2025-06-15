
import { supabase } from '@/integrations/supabase/client';
import { ProposalType } from '@/types/student';
import { toast } from 'sonner';
import { fetchTeamSupervisors } from './supervisorService';

export const fetchStudentProposals = async (userId: string): Promise<ProposalType[]> => {
  try {
    // Fetch all proposals by the student
    const { data: proposalsData, error: proposalsError } = await supabase
      .from('proposals')
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        supervisor_id,
        company_name,
        team_id,
        rejection_reason
      `)
      .eq('student_id', userId)
      .order('created_at', { ascending: false });
    
    if (proposalsError) {
      console.error('Error fetching proposals:', proposalsError);
      toast.error('Gagal memuat data proposal');
      return [];
    }
    
    if (!proposalsData || proposalsData.length === 0) {
      return [];
    }

    // Process proposals data
    const processedProposals: ProposalType[] = [];
    
    for (const proposal of proposalsData) {
      let supervisorData = null;
      let teamData = null;
      let supervisors = [];
      let documents = [];

      // Fetch team data if exists
      if (proposal.team_id) {
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select('id, name')
          .eq('id', proposal.team_id)
          .single();
          
        if (!teamError) {
          teamData = team;
          
          // Always fetch team supervisors first - ensuring we get ALL supervisors
          try {
            console.log("Fetching supervisors for team:", proposal.team_id);
            const teamSupervisors = await fetchTeamSupervisors(proposal.team_id);
            console.log("Team supervisors result:", teamSupervisors);
            
            // Add team supervisors to the supervisors array
            if (teamSupervisors && teamSupervisors.length > 0) {
              supervisors = teamSupervisors.map(supervisor => ({
                id: supervisor.id,
                full_name: supervisor.full_name,
                profile_image: supervisor.profile_image
              }));
              console.log("Mapped team supervisors:", supervisors);
            }
          } catch (error) {
            console.error("Error fetching team supervisors:", error);
          }
        }
      }
      
      // If no team supervisors found and there's a direct supervisor_id, fetch that as fallback
      if (supervisors.length === 0 && proposal.supervisor_id) {
        console.log("No team supervisors found, fetching direct supervisor:", proposal.supervisor_id);
        const { data: supervisor, error: supervisorError } = await supabase
          .from('profiles')
          .select('id, full_name, profile_image')
          .eq('id', proposal.supervisor_id)
          .single();
          
        if (!supervisorError && supervisor) {
          supervisorData = supervisor;
          // Add to supervisors array
          supervisors.push({
            id: supervisor.id,
            full_name: supervisor.full_name,
            profile_image: supervisor.profile_image
          });
        }
      }

      // Fetch proposal documents (latest first)
      const { data: docs, error: docsError } = await supabase
        .from('proposal_documents')
        .select('id, file_name, file_url, file_type')
        .eq('proposal_id', proposal.id)
        .order('uploaded_at', { ascending: false });

      if (!docsError && docs && docs.length > 0) {
        documents = docs.map((doc: any) => ({
          id: doc.id,
          fileName: doc.file_name,
          fileUrl: doc.file_url,
          fileType: doc.file_type,
        }));
      }
      
      console.log("Final supervisors for proposal:", proposal.id, supervisors);
      
      processedProposals.push({
        id: proposal.id,
        title: proposal.title,
        description: proposal.description || '',
        status: proposal.status || 'draft',
        submissionDate: proposal.created_at,
        created_at: proposal.created_at,
        supervisor: supervisorData,
        supervisors: supervisors,
        companyName: proposal.company_name,
        team: teamData,
        team_id: proposal.team_id,
        rejectionReason: proposal.rejection_reason,
        studentId: userId,
        documents, // <---- assign here!
      });
    }
    
    return processedProposals;
  } catch (error) {
    console.error('Error fetching proposals:', error);
    toast.error('Gagal memuat data proposal');
    return [];
  }
};
