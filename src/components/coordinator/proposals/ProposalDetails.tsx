
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/proposalConstants";
import ProposalDescription from "./sections/ProposalDescription";
import CompanyInfo from "./sections/CompanyInfo";
import RejectionInfo from "./sections/RejectionInfo";
import DocumentSection from "./sections/DocumentSection";

interface ProposalDetailsProps {
  title: string;
  createdAt: string;
  description: string;
  companyName?: string | null;
  rejectionReason?: string | null;
  status: string;
  documents: Array<{
    id: string;
    file_name: string;
    file_url: string;
    file_type?: string;
  }>;
  onPreviewDocument: (url: string, name: string) => void;
  onDownloadFile: (url: string, fileName: string) => void;
}

const ProposalDetails = ({
  title,
  createdAt,
  description,
  companyName,
  rejectionReason,
  status,
  documents,
  onPreviewDocument,
  onDownloadFile
}: ProposalDetailsProps) => {
  // Sort documents by name in descending order (assuming the name contains timestamp)
  const sortedDocuments = [...documents].sort((a, b) => 
    b.file_name.localeCompare(a.file_name)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Submitted: {formatDate(createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProposalDescription description={description} />
        <CompanyInfo companyName={companyName} />
        <RejectionInfo status={status} rejectionReason={rejectionReason} />
        <DocumentSection 
          documents={sortedDocuments}
          onPreviewDocument={onPreviewDocument}
          onDownloadFile={onDownloadFile}
          showOnlyLatest={true}
        />
      </CardContent>
    </Card>
  );
};

export default ProposalDetails;
