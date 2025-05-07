
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  draft: "bg-gray-500",
  submitted: "bg-yellow-500",
  reviewed: "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
};

const statusLabels = {
  draft: "Draft",
  submitted: "Diajukan",
  reviewed: "Ditinjau",
  approved: "Disetujui",
  rejected: "Ditolak",
};

interface ProposalDetailHeaderProps {
  title: string;
  submissionDate: string;
  status: string;
  formatDate: (dateString: string) => string;
}

const ProposalDetailHeader = ({
  title,
  submissionDate,
  status,
  formatDate
}: ProposalDetailHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Diajukan: {formatDate(submissionDate)}
        </CardDescription>
      </div>
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    </CardHeader>
  );
};

export default ProposalDetailHeader;
