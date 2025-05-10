export type ProposalType = {
  id: string;
  title: string;
  description: string;
  status: string;
  submissionDate: string;
  companyName?: string;
  studentId?: string; // Add this field for evaluation support
}

export type TeamType = {
  id: string;
  name: string;
  member_count: number;
};
