
import { Card } from "@/components/ui/card";
import { StatusCard } from "@/components/student/dashboard/StatusCard";
import { TeamCard } from "@/components/student/dashboard/TeamCard";
import { ActionCards } from "@/components/student/dashboard/ActionCards";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { formatDate, statusColors, statusLabels } from "@/utils/formatters";
import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { calculateFinalGrade } from '@/services/evaluationService';

// Grade scale definition
const gradeScale = {
  A: { min: 85, max: 100 },
  B: { min: 70, max: 84.99 },
  C: { min: 55, max: 69.99 },
  D: { min: 40, max: 54.99 },
  E: { min: 0, max: 39.99 }
};

// Convert numeric score to letter grade
const getLetterGrade = (score: number) => {
  for (const [letter, range] of Object.entries(gradeScale)) {
    if (score >= range.min && score <= range.max) {
      return letter;
    }
  }
  return 'N/A';
};

const StudentDashboard = () => {
  const { 
    proposals, 
    selectedProposal, 
    team, 
    loading, 
    handleSelectProposal 
  } = useStudentDashboard();

  const [finalGrade, setFinalGrade] = useState<number | null>(null);
  const [academicGrade, setAcademicGrade] = useState<number | null>(null);
  const [fieldGrade, setFieldGrade] = useState<number | null>(null);
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
            setAcademicGrade(gradeData.academicSupervisorScore || null);
            setFieldGrade(gradeData.fieldSupervisorScore || null);
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
            <p className="text-sm text-gray-600">Nilai hasil evaluasi pembimbing</p>
            
            {loadingGrade ? (
              <div className="flex justify-center py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            ) : finalGrade !== null ? (
              <>
                <div className="flex items-center justify-center">
                  <Badge className="text-xl py-6 px-6 bg-primary hover:bg-primary">
                    {finalGrade.toFixed(1)}
                    <span className="ml-2">({getLetterGrade(finalGrade)})</span>
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-md">
                    <span className="text-lg font-bold">{academicGrade ? academicGrade.toFixed(0) : '-'}</span>
                    <span className="text-xs text-gray-600">Nilai Pembimbing Akademik</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-md">
                    <span className="text-lg font-bold">{fieldGrade ? fieldGrade.toFixed(0) : '-'}</span>
                    <span className="text-xs text-gray-600">Nilai Pembimbing Lapangan</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  <p>Skala Nilai: A (85-100), B (70-84.99), C (55-69.99), D (40-54.99), E (0-39.99)</p>
                </div>
              </>
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
