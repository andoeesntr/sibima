
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatusCard } from '@/components/student/dashboard/StatusCard';
import { ActionCards } from '@/components/student/dashboard/ActionCards';
import { TeamCard } from '@/components/student/dashboard/TeamCard';
import KpTimeline from '@/components/coordinator/KpTimeline';
import { useStudentDashboard } from '@/hooks/useStudentDashboard';

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
    lastTeam
  } = useStudentDashboard();

  const handleStatusFilter = (status: string) => {
    setActiveTab(status);
  };

  const navigateToProposalSubmission = () => {
    navigate('/student/proposal-submission');
  };

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
      <div className="mb-6">
        <KpTimeline readOnly={true} />
      </div>
      
      {/* Status Card */}
      <StatusCard
        proposals={proposals}
        activeTab={activeTab}
        onTabChange={handleStatusFilter}
        selectedProposal={selectedProposal}
        onSelectProposal={handleSelectProposal}
      />

      {/* Team Card if user is in a team */}
      {isInTeam && lastTeam && (
        <TeamCard team={lastTeam} />
      )}

      {/* Action Cards */}
      <ActionCards
        hasActiveProposal={hasActiveProposal}
        onSubmitProposal={navigateToProposalSubmission}
        selectedProposal={selectedProposal}
      />
      
      {/* Submit Proposal Button (if not in a proposal yet) */}
      {!hasActiveProposal && (
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
