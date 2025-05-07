
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Proposal, UseProposalDataResult } from '@/types/coordinator/proposal';
import { fetchProposalById } from '@/services/coordinatorProposalService';
import { Supervisor } from '@/services/supervisorService';

export const useProposalData = (): UseProposalDataResult => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);

  const fetchProposal = async () => {
    if (!id) return;
      
    setLoading(true);
    try {
      const fetchedProposal = await fetchProposalById(id);
      
      if (fetchedProposal) {
        setProposal(fetchedProposal);
        setSupervisors(fetchedProposal.supervisors);
        console.log("Fetched proposal data:", fetchedProposal);
      } else {
        throw new Error("Failed to fetch proposal");
      }
    } catch (error) {
      console.error("Error fetching proposal data:", error);
      toast.error("Gagal memuat data proposal");
      navigate('/coordinator/proposal-review');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSupervisors = (updatedSupervisors: Supervisor[]) => {
    if (!proposal) return;

    // Update the proposal state with new supervisors
    setProposal({
      ...proposal,
      supervisors: updatedSupervisors
    });

    setSupervisors(updatedSupervisors);
  };

  useEffect(() => {
    fetchProposal();
  }, [id, navigate]);

  return { 
    proposal, 
    loading, 
    supervisors,
    fetchProposal,
    handleUpdateSupervisors
  };
};
