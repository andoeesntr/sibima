
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProposalHeaderProps {
  title: string;
  status: string;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
}

const ProposalHeader = ({ title, status, statusColors, statusLabels }: ProposalHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button 
          onClick={() => navigate('/coordinator/proposal-review')}
          variant="outline"
          size="icon"
        >
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    </div>
  );
};

export default ProposalHeader;
