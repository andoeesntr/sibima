
import { ProposalStatus } from '@/types/proposals';

export interface FeedbackEntry {
  id: string;
  content: string;
  createdAt: string;
  supervisorName: string;
}

export interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  submissionDate: string;
  status: string;
  studentName: string;
  studentId: string;
  rejectionReason?: string;
  teamName?: string;
  teamId?: string;
  companyName?: string;
  supervisors?: {
    id: string;
    full_name: string;
    profile_image?: string;
  }[];
  documents?: Document[];
  feedback?: FeedbackEntry[];
  supervisorIds: string[];
}
