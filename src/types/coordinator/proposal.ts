
export interface ProposalDocument {
  id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
}

export interface TeamMember {
  id: string;
  full_name: string;
  nim?: string;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at?: string;
  student: {
    id: string;
    full_name: string;
  };
  supervisors: {
    id: string;
    full_name: string;
    profile_image?: string;
  }[];
  company_name?: string;
  team?: Team;
  documents: ProposalDocument[];
  rejectionReason?: string;
  team_id?: string | null;
  supervisor_id?: string | null;
}

export interface UseProposalDataResult {
  proposal: Proposal | null;
  loading: boolean;
  supervisors: {
    id: string;
    full_name: string;
    profile_image?: string;
  }[];
  fetchProposal: () => Promise<void>;
  handleUpdateSupervisors: (supervisors: {
    id: string;
    full_name: string;
    profile_image?: string;
  }[]) => void;
}
