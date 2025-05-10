
import { useEffect } from 'react';
import { useStudentDashboard } from '@/hooks/useStudentDashboard';
import { StatusCard } from '@/components/student/dashboard/StatusCard';
import { ActionCards } from '@/components/student/dashboard/ActionCards';
import { TeamCard } from '@/components/student/dashboard/TeamCard';
import FinalGradeCard from '@/components/student/dashboard/FinalGradeCard';

const StudentDashboard = () => {
  const { 
    proposals,
    selectedProposal, 
    team,
    loading,
    handleSelectProposal,
  } = useStudentDashboard();

  useEffect(() => {
    // Initial data loading happens in the hook
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard Mahasiswa</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <StatusCard 
            proposals={proposals}
            selectedProposal={selectedProposal} 
            loading={loading}
            onSelectProposal={handleSelectProposal}
            formatDate={(date) => new Date(date).toLocaleDateString('id-ID')}
            statusColors={{
              submitted: "bg-yellow-500 hover:bg-yellow-600",
              approved: "bg-green-500 hover:bg-green-600",
              rejected: "bg-red-500 hover:bg-red-600"
            }}
            statusLabels={{
              submitted: "Diajukan",
              approved: "Disetujui",
              rejected: "Ditolak"
            }}
          />
          
          <ActionCards 
            selectedProposal={selectedProposal}
          />
        </div>
        
        <div className="space-y-4">
          <TeamCard 
            team={team}
          />
          
          <FinalGradeCard />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
