import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  rejectionReason?: string | null;
}

export const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  submitted: "bg-yellow-500",
  revision: "bg-amber-500",
  reviewed: "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
};

export const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Diajukan",
  revision: "Perlu Revisi",
  reviewed: "Ditinjau",
  approved: "Disetujui",
  rejected: "Ditolak",
};

const StatusBadge = ({ status, rejectionReason }: StatusBadgeProps) => {
  // We can still keep the compatibility to show revision for old data
  // where submitted status has a rejection reason
  const displayStatus = (status === 'submitted' && rejectionReason) ? 'revision' : status;
  
  return (
    <Badge className={statusColors[displayStatus] || "bg-gray-500"}>
      {statusLabels[displayStatus] || "Unknown"}
    </Badge>
  );
};

export default StatusBadge;
