
export type ProposalType = {
  id: string;
  title: string;
  description: string;
  status: string;
  submissionDate: string;
  companyName?: string;
  studentId?: string; // For evaluation support
  
  // Additional properties needed by StatusCard
  created_at?: string;
  reviewDate?: string;
  rejectionReason?: string;
  
  // For team and supervisor references
  team_id?: string;
  team?: {
    id: string;
    name: string;
  };
  supervisor?: {
    id: string;
    full_name: string;
    profile_image?: string;
  };
  supervisors?: {
    id: string;
    full_name: string;
    profile_image?: string;
  }[];
}

export type TeamMember = {
  id: string;
  full_name: string;
  nim?: string;
  profile_image?: string;
};

export type TeamSupervisor = {
  id: string;
  name: string;
  profile_image?: string;
};

export type TeamSupervisor = {
  id: string;
  name: string;
  profile_image?: string;
};

export type TeamType = {
  id: string;
  name: string;
  member_count?: number;
  members?: TeamMember[];
  supervisors?: TeamSupervisor[];
};
