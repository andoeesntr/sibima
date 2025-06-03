
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge";

interface ProposalHeaderProps {
  status: string;
}

const ProposalHeader = ({ status }: ProposalHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <Button 
        variant="outline" 
        onClick={() => navigate('/student')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
      </Button>
      <StatusBadge status={status} />
    </div>
  );
};

export default ProposalHeader;
