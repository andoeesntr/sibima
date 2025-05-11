
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProposalHeaderProps {
  title: string;
  status: string;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  onGoBack: () => void;
}

const ProposalHeader = ({
  title,
  status,
  statusColors,
  statusLabels,
  onGoBack
}: ProposalHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={onGoBack} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div 
        className={`${statusColors[status] || 'bg-gray-500'} text-white px-3 py-1 rounded-full text-sm`}
      >
        {statusLabels[status] || status}
      </div>
    </div>
  );
};

export default ProposalHeader;
