
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
  // Sort attachments by uploaded_at in descending order (newest first)
  const sortedAttachments = [...attachments].sort((a, b) => 
    new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
  );
  
  // Only show the most recent attachment
  const displayAttachments = sortedAttachments.length > 0 ? [sortedAttachments[0]] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{proposal.title}</CardTitle>
        <CardDescription>
          Diajukan pada {formatDate(proposal.created_at)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {(proposal.status === 'rejected' || proposal.status === 'revision' || 
          (proposal.status === 'submitted' && proposal.rejection_reason)) && 
          proposal.rejection_reason && (
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
            attachments={displayAttachments} 
            onPreview={onPreview} 
          />
        </div>
      </CardContent>
      <CardFooter>
        <ProposalFooter 
          status={proposal.status} 
          proposalId={proposal.id}
          rejectionReason={proposal.rejection_reason} 
        />
      </CardFooter>
    </Card>
  );
};

export default ProposalDetailContent;
