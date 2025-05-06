
export interface TeamMember {
  id: string;
  full_name: string;
  nim?: string;
  profile_image?: string;
}

export interface TeamSupervisor {
  id: string;
  name: string;
  profile_image?: string;
}

export interface TeamType {
  id: string;
  name: string;
  members: TeamMember[];
  supervisors: TeamSupervisor[];
}

export interface ProposalType {
  id: string;
  title: string;
  status: string;
  submissionDate?: string;
  created_at: string;
  reviewDate?: string;
  rejectionReason?: string;
  supervisor?: {
    id: string;
    full_name: string;
    profile_image?: string;
  } | null;
  company_name?: string | null;
  team?: {
    id: string;
    name: string;
  } | null;
  team_id?: string | null;
}
