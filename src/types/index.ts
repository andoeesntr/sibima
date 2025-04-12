
// User types
export type UserRole = 'student' | 'coordinator' | 'admin' | 'supervisor';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  profilePicture?: string;
}

// Student specific types
export interface Student extends User {
  nim: string;
  faculty: string;
  department: string;
  kpTeamId?: string;
}

export interface KpTeam {
  id: string;
  name: string;
  members: Student[];
  supervisors: Supervisor[];
  proposalId?: string;
}

// Supervisor specific types
export interface Supervisor extends User {
  nip: string;
  department: string;
  hasDigitalSignature: boolean;
}

// Proposal types
export type ProposalStatus = 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  teamId: string;
  supervisorIds: string[];
  status: ProposalStatus;
  submissionDate: string;
  reviewDate?: string;
  rejectionReason?: string;
  feedback?: string[];
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  fileUrl: string;
  uploadDate: string;
  type: 'proposal' | 'report' | 'guide' | 'signature' | 'other';
}

// Dashboard types
export interface DashboardStats {
  totalProposals: number;
  approvedProposals: number;
  pendingProposals: number;
  rejectedProposals: number;
}

// Guide document types
export interface GuideDocument {
  id: string;
  title: string;
  fileUrl: string;
  uploadDate: string;
  description?: string;
}

// Activity log types
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: 'proposal' | 'user' | 'team' | 'guide' | 'system';
  targetId?: string;
  timestamp: string;
}
