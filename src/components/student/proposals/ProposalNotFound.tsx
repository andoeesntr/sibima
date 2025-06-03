
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProposalNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold text-gray-800">Proposal tidak ditemukan</h2>
      <p className="mt-2 text-gray-600">Proposal yang Anda cari tidak dapat ditemukan atau Anda tidak memiliki akses.</p>
      <Button 
        className="mt-6"
        onClick={() => navigate('/student')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Dashboard
      </Button>
    </div>
  );
};

export default ProposalNotFound;
