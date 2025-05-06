
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: string;
  submissionDate: string;
  reviewDate?: string;
  supervisorIds: string[];
  supervisors?: {
    id: string;
    full_name: string;
    profile_image?: string;
  }[];
  studentName?: string;
  companyName?: string;
  documentUrl?: string;
  teamId?: string;
  teamName?: string;
  documents?: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType?: string;
  }[];
  feedback?: {
    id: string;
    content: string;
    created_at: string;
    supervisor_id: string;
    supervisor_name?: string;
  }[];
  rejectionReason?: string;
}

export type ProposalStatus = 'submitted' | 'approved' | 'rejected' | 'all';

export const useProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      
      // Fetch proposals with student information and team data
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          id, 
          title,
          description,
          status, 
          created_at,
          company_name,
          supervisor_id,
          student_id,
          team_id,
          rejection_reason,
          student:profiles!student_id (full_name),
          team:teams (id, name)
        `);
      
      if (error) {
        console.error("Error fetching proposals:", error);
        throw error;
      }

      console.log("Raw proposal data:", data);

      if (!data) {
        setProposals([]);
        return;
      }

      // Fetch documents and feedback for each proposal
      const proposalsWithDetails = await Promise.all(
        data.map(async (proposal) => {
          // Fetch documents
          const { data: documentData, error: documentError } = await supabase
            .from('proposal_documents')
            .select('id, file_name, file_url, file_type')
            .eq('proposal_id', proposal.id);
          
          if (documentError) {
            console.error(`Error fetching documents for proposal ${proposal.id}:`, documentError);
          }

          // For feedback, join with profiles separately
          const { data: feedbackData, error: feedbackError } = await supabase
            .from('proposal_feedback')
            .select(`
              id, 
              content, 
              created_at, 
              supervisor_id
            `)
            .eq('proposal_id', proposal.id);
          
          if (feedbackError) {
            console.error(`Error fetching feedback for proposal ${proposal.id}:`, feedbackError);
          }

          // Fetch supervisor names for feedback
          let feedbackWithNames = [];
          if (feedbackData && feedbackData.length > 0) {
            feedbackWithNames = await Promise.all(
              feedbackData.map(async (feedback) => {
                const { data: supervisorData } = await supabase
                  .from('profiles')
                  .select('full_name')
                  .eq('id', feedback.supervisor_id)
                  .single();
                
                return {
                  ...feedback,
                  supervisor_name: supervisorData?.full_name
                };
              })
            );
          }

          // Fetch all supervisors for this proposal if it's a team proposal
          let supervisors = [];
          if (proposal.team_id) {
            const { data: teamSupervisors, error: supervisorsError } = await supabase
              .from('team_supervisors')
              .select(`supervisor_id`)
              .eq('team_id', proposal.team_id);
            
            if (supervisorsError) {
              console.error(`Error fetching supervisors for team ${proposal.team_id}:`, supervisorsError);
            } else if (teamSupervisors && teamSupervisors.length > 0) {
              // Fetch supervisor details
              const supervisorIds = teamSupervisors.map(s => s.supervisor_id);
              const { data: supervisorProfiles } = await supabase
                .from('profiles')
                .select('id, full_name, profile_image')
                .in('id', supervisorIds);
              
              supervisors = supervisorProfiles || [];
            }
          }
          
          // If no team supervisors found, use the main supervisor
          if (supervisors.length === 0 && proposal.supervisor_id) {
            const { data: mainSupervisor, error: supervisorError } = await supabase
              .from('profiles')
              .select('id, full_name, profile_image')
              .eq('id', proposal.supervisor_id)
              .single();
            
            if (!supervisorError && mainSupervisor) {
              supervisors = [mainSupervisor];
            }
          }

          // Transform data for our component
          return {
            id: proposal.id,
            title: proposal.title,
            description: proposal.description || '',
            status: proposal.status || 'submitted',
            submissionDate: proposal.created_at,
            studentName: proposal.student?.full_name || 'Unknown Student',
            supervisorIds: proposal.supervisor_id ? [proposal.supervisor_id] : [],
            supervisors: supervisors,
            companyName: proposal.company_name,
            teamId: proposal.team_id,
            teamName: proposal.team?.name,
            rejectionReason: proposal.rejection_reason,
            documents: documentData?.map(doc => ({
              id: doc.id,
              fileName: doc.file_name,
              fileUrl: doc.file_url,
              fileType: doc.file_type
            })) || [],
            feedback: feedbackWithNames || []
          };
        })
      );
      
      setProposals(proposalsWithDetails);
      console.log("Fetched proposals with details:", proposalsWithDetails);
    } catch (error: any) {
      console.error("Error fetching proposals:", error);
      toast.error("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  };

  // Function to save feedback to the database
  const saveFeedback = async (proposalId: string, supervisorId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('proposal_feedback')
        .insert({
          proposal_id: proposalId,
          supervisor_id: supervisorId,
          content: content
        })
        .select();
      
      if (error) {
        console.error("Error saving feedback:", error);
        throw error;
      }

      // Refresh proposals after adding feedback
      await fetchProposals();
      return data;
    } catch (error: any) {
      console.error("Error saving feedback:", error);
      toast.error("Failed to save feedback");
      throw error;
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return {
    proposals,
    loading,
    fetchProposals,
    saveFeedback
  };
};
