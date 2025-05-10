
import { Card } from "@/components/ui/card";
import { StatusCard } from "@/components/student/dashboard/StatusCard";
import { TeamCard } from "@/components/student/dashboard/TeamCard";
import { ActionCards } from "@/components/student/dashboard/ActionCards";
import { FinalGradeCard } from "@/components/student/dashboard/FinalGradeCard";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { formatDate, statusColors, statusLabels } from "@/utils/formatters";

const StudentDashboard = () => {
  const { 
    proposals, 
    selectedProposal, 
    team, 
    finalGrade,
    loading, 
    handleSelectProposal 
  } = useStudentDashboard();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KP Status Card */}
        <StatusCard 
          proposals={proposals}
          selectedProposal={selectedProposal}
          onSelectProposal={handleSelectProposal}
          formatDate={formatDate}
          statusColors={statusColors}
          statusLabels={statusLabels}
        />

        {/* KP Team Card */}
        <TeamCard team={team} />
        
        {/* Final Grade Card */}
        <FinalGradeCard finalGrade={finalGrade} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCards selectedProposal={selectedProposal} />
      </div>
    </div>
  );
};

export default StudentDashboard;
