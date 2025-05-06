
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  submitted: "bg-yellow-500",
  reviewed: "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
};

export const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Diajukan",
  reviewed: "Ditinjau",
  approved: "Disetujui",
  rejected: "Ditolak",
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <Badge className={statusColors[status] || "bg-gray-500"}>
      {statusLabels[status] || "Unknown"}
    </Badge>
  );
};

export default StatusBadge;
