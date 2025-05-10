
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
  student?: {
    nim?: string;
    full_name?: string;
  };
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
