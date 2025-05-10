
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/dateUtils";
import { Supervisor } from "@/services/supervisorService";
import RejectionMessage from "./RejectionMessage";
import ProposalInfo from "./ProposalInfo";
import AttachmentList from "./AttachmentList";
import ProposalFooter from "./ProposalFooter";

interface ProposalDetailContentProps {
  proposal: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    company_name: string | null;
    created_at: string;
    updated_at: string | null;
    rejection_reason?: string;
  };
  supervisors: Supervisor[];
  attachments: {
    id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    uploaded_at: string;
  }[];
  onPreview: (url: string, name: string) => void;
}

const ProposalDetailContent = ({
  proposal,
  supervisors,
  attachments,
  onPreview
}: ProposalDetailContentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{proposal.title}</CardTitle>
        <CardDescription>
          Diajukan pada {formatDate(proposal.created_at)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {proposal.status === 'rejected' && proposal.rejection_reason && (
          <RejectionMessage rejectionReason={proposal.rejection_reason} />
        )}

        <ProposalInfo
          companyName={proposal.company_name}
          description={proposal.description}
          createdAt={proposal.created_at}
          updatedAt={proposal.updated_at}
          supervisors={supervisors}
          formatDate={formatDate}
        />

        <div>
          <h3 className="font-medium mb-3">Lampiran</h3>
          <AttachmentList 
            attachments={attachments} 
            onPreview={onPreview} 
          />
        </div>
      </CardContent>
      <CardFooter>
        <ProposalFooter status={proposal.status} />
      </CardFooter>
    </Card>
  );
};

export default ProposalDetailContent;
