
import { Card } from "@/components/ui/card";
import { StatusCard } from "@/components/student/dashboard/StatusCard";
import { TeamCard } from "@/components/student/dashboard/TeamCard";
import { ActionCards } from "@/components/student/dashboard/ActionCards";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { formatDate, statusColors, statusLabels } from "@/utils/formatters";
import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { calculateFinalGrade } from '@/services/evaluationService';

const StudentDashboard = () => {
  const { 
    proposals, 
    selectedProposal, 
    team, 
    loading, 
    handleSelectProposal 
  } = useStudentDashboard();

  const [finalGrade, setFinalGrade] = useState<number | null>(null);
  const [loadingGrade, setLoadingGrade] = useState(false);

  useEffect(() => {
    const fetchFinalGrade = async () => {
      if (!selectedProposal) return;
      
      setLoadingGrade(true);
      try {
        const studentId = selectedProposal.studentId;
        if (studentId) {
          const gradeData = await calculateFinalGrade(studentId);
          if (gradeData) {
            setFinalGrade(gradeData.score);
          }
        }
      } catch (error) {
        console.error("Error fetching final grade:", error);
      } finally {
        setLoadingGrade(false);
      }
    };

    fetchFinalGrade();
  }, [selectedProposal]);

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
        <Card className="p-4 h-fit">
          <div className="flex flex-col space-y-4">
            <h3 className="font-semibold text-lg">Nilai Akhir KP</h3>
            {loadingGrade ? (
              <div className="flex justify-center py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            ) : finalGrade !== null ? (
              <div className="flex items-center justify-center">
                <Badge className="text-xl py-3 px-4 bg-primary hover:bg-primary">
                  {finalGrade.toFixed(1)}
                </Badge>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center">
                Belum ada penilaian
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCards selectedProposal={selectedProposal} />
      </div>
    </div>
  );
};

export default StudentDashboard;
