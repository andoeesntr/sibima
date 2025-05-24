
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatusCard } from '@/components/student/dashboard/StatusCard';
import { ActionCards } from '@/components/student/dashboard/ActionCards';
import { TeamCard } from '@/components/student/dashboard/TeamCard';
import KpTimeline from '@/components/coordinator/KpTimeline';
import { useStudentDashboard } from '@/hooks/useStudentDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');

  const {
    loading,
    proposals,
    selectedProposal,
    handleSelectProposal,
    hasActiveProposal,
    isInTeam,
    lastTeam,
    evaluations
  } = useStudentDashboard();

  const handleStatusFilter = (status: string) => {
    setActiveTab(status);
  };

  const navigateToProposalSubmission = () => {
    navigate('/student/proposal-submission');
  };

  // Calculate final score - average of all evaluations
  const finalScore = evaluations && evaluations.length > 0
    ? evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluations.length
    : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Timeline at the top */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <h2 className="text-lg font-medium mb-2">Timeline KP</h2>
        <KpTimeline readOnly={true} />
      </div>
      
      {/* Status and Team Cards in a grid with adjusted proportions */}
      <div className="grid grid-cols-12 gap-6">
        {/* Status Card - wider (70%) */}
        <div className="col-span-8">
          <StatusCard
            proposals={proposals}
            activeTab={activeTab}
            onTabChange={handleStatusFilter}
            selectedProposal={selectedProposal}
            onSelectProposal={handleSelectProposal}
          />
        </div>

        {/* Team Card - narrower (30%) */}
        <div className="col-span-4">
          {isInTeam && lastTeam ? (
            <TeamCard team={lastTeam} />
          ) : (
            <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
              <CardHeader>
                <CardTitle>Tim KP</CardTitle>
                <CardDescription>Informasi tim KP Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-gray-600">Anda belum memiliki tim KP</p>
                  {!hasActiveProposal && (
                    <Button 
                      className="mt-4 bg-primary hover:bg-primary/90"
                      onClick={navigateToProposalSubmission}
                    >
                      Buat Tim KP
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Final Score Card */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Nilai Akhir KP</CardTitle>
          <CardDescription>Nilai hasil evaluasi pembimbing</CardDescription>
        </CardHeader>
        <CardContent>
          {finalScore !== null ? (
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full bg-primary text-white flex items-center justify-center">
                <span className="text-3xl font-bold">{finalScore.toFixed(1)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600">Belum ada penilaian</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Access Cards */}
      <h2 className="text-lg font-medium">Akses Cepat</h2>
      <ActionCards
        hasActiveProposal={hasActiveProposal}
        onSubmitProposal={navigateToProposalSubmission}
        selectedProposal={selectedProposal}
      />
      
      {/* Submit Proposal Button (only show if no active proposal) */}
      {!hasActiveProposal && proposals.length === 0 && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={navigateToProposalSubmission}
            className="bg-primary hover:bg-primary/90 px-8"
          >
            Ajukan Proposal KP
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
