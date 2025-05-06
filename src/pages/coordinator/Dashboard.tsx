
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import KpTimeline from '@/components/coordinator/KpTimeline';
import StatsCards from '@/components/coordinator/dashboard/StatsCards';
import PendingProposals from '@/components/coordinator/dashboard/PendingProposals';
import RecentActivity from '@/components/coordinator/dashboard/RecentActivity';

interface Proposal {
  id: string;
  title: string;
  status: string;
  submissionDate: string;
  studentName?: string;
}

const CoordinatorDashboard = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchProposals();
  }, []);
  
  const fetchProposals = async () => {
    try {
      setLoading(true);
      
      // Fetch proposals with student information
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          id,
          title,
          status,
          created_at,
          student:profiles!student_id (full_name)
        `);
      
      if (error) {
        throw error;
      }

      if (data) {
        // Transform data for our component
        const formattedProposals = data.map(proposal => ({
          id: proposal.id,
          title: proposal.title,
          status: proposal.status || 'submitted',
          submissionDate: proposal.created_at,
          studentName: proposal.student?.full_name || 'Unknown Student'
        }));
        
        setProposals(formattedProposals);
        console.log("Fetched proposals:", formattedProposals);
      } else {
        setProposals([]);
      }
    } catch (error: any) {
      console.error("Error fetching proposals:", error);
      toast.error("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  };
  
  const pendingProposals = proposals.filter(p => p.status === 'submitted');
  
  // Calculate stats
  const stats = {
    totalProposals: proposals.length,
    pendingProposals: proposals.filter(p => p.status === 'submitted').length,
    approvedProposals: proposals.filter(p => p.status === 'approved').length,
    rejectedProposals: proposals.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Koordinator KP</h1>
      
      {/* KP Timeline */}
      <KpTimeline />
      
      {/* Stats Cards */}
      <StatsCards stats={stats} />
      
      {/* Pending Proposals and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PendingProposals loading={loading} pendingProposals={pendingProposals} />
        <RecentActivity />
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
