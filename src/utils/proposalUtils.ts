
import { Proposal } from '@/types/proposals';

export async function transformProposalData(
  rawProposalData: any,
  documentsData: any[],
  feedbackWithNames: any[],
  supervisors: any[]
): Promise<Proposal> {
  return {
    id: rawProposalData.id,
    title: rawProposalData.title,
    description: rawProposalData.description || '',
    status: rawProposalData.status || 'submitted',
    submissionDate: rawProposalData.created_at,
    studentName: rawProposalData.student?.full_name || 'Unknown Student',
    supervisorIds: rawProposalData.supervisor_id ? [rawProposalData.supervisor_id] : [],
    supervisors: supervisors,
    companyName: rawProposalData.company_name,
    teamId: rawProposalData.team_id,
    teamName: rawProposalData.team?.name,
    rejectionReason: rawProposalData.rejection_reason,
    documents: documentsData?.map(doc => ({
      id: doc.id,
      fileName: doc.file_name,
      fileUrl: doc.file_url,
      fileType: doc.file_type
    })) || [],
    feedback: feedbackWithNames || []
  };
}
