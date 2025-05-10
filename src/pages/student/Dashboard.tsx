
import { useEffect } from 'react';
import { useStudentDashboard } from '@/hooks/useStudentDashboard';
import StatusCard from '@/components/student/dashboard/StatusCard';
import ActionCards from '@/components/student/dashboard/ActionCards';
import TeamCard from '@/components/student/dashboard/TeamCard';
import FinalGradeCard from '@/components/student/dashboard/FinalGradeCard';

const StudentDashboard = () => {
  const { 
    proposal, 
    team,
    loading,
    refreshDashboardData,
  } = useStudentDashboard();

  useEffect(() => {
    refreshDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard Mahasiswa</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <StatusCard 
            proposal={proposal} 
            loading={loading} 
          />
          
          <ActionCards 
            proposal={proposal} 
            team={team}
            loading={loading} 
          />
        </div>
        
        <div className="space-y-4">
          <TeamCard 
            team={team} 
            loading={loading}
          />
          
          <FinalGradeCard />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
