
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusCard } from "@/components/student/dashboard/StatusCard";
import { TeamCard } from "@/components/student/dashboard/TeamCard";
import { ActionCards } from "@/components/student/dashboard/ActionCards";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { useNavigate } from "react-router-dom";
import KpTimeline from "@/components/coordinator/KpTimeline";
import { KpEvaluationCard } from "@/components/student/dashboard/KpEvaluationCard";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    proposals,
    mainProposal,
    team,
    loading,
    handleSelectProposal,
    hasActiveProposal,
    hasApprovedProposal,
    isInTeam,
    lastTeam,
    evaluations,
  } = useStudentDashboard();

  const [proposalModalOpen, setProposalModalOpen] = useState(false);

  const handleSubmitProposal = () => {
    if (hasApprovedProposal) {
      return;
    }
    navigate('/student/proposal-submission');
  };

  // Ambil proposal terbaru saja untuk riwayat & status
  const latestProposal = proposals.length > 0 ? proposals[0] : null;
  const otherProposals = proposals.length > 1 ? proposals.slice(1) : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 md:px-6 space-y-8">
      <h1 className="text-2xl font-bold mt-4 mb-2">Dashboard Mahasiswa</h1>

      {/* Timeline KP */}
      <div>
        <KpTimeline readOnly />
      </div>

      {/* Status KP dan Tim KP */}
      <div className="flex flex-col md:flex-row gap-8 w-full">
        <div className="flex-1 min-w-0">
          <StatusCard
            proposals={latestProposal ? [latestProposal] : []}
            selectedProposal={latestProposal}
            onSelectProposal={handleSelectProposal}
            evaluations={evaluations}
          />
        </div>
        <div className="w-full md:max-w-xs">
          <TeamCard team={lastTeam} />
        </div>
      </div>

      {/* Nilai KP */}
      <div>
        <KpEvaluationCard evaluations={evaluations} />
      </div>

      {/* Riwayat Proposal */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Proposal</CardTitle>
            <CardDescription>
              Proposal terakhir yang Anda kirimkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {latestProposal ? (
              <div className="border rounded-lg p-4 bg-gray-50 mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{latestProposal.title}</h3>
                    <p className="text-sm text-gray-600">{latestProposal.companyName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    latestProposal.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : latestProposal.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : latestProposal.status === 'revision'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {latestProposal.status === 'approved'
                      ? 'Disetujui'
                      : latestProposal.status === 'rejected'
                      ? 'Ditolak'
                      : latestProposal.status === 'revision'
                      ? 'Revisi'
                      : 'Menunggu'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Belum ada proposal yang diajukan
              </p>
            )}
            {otherProposals.length > 0 &&
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setProposalModalOpen(true)}
              >
                Lihat Proposal Lain
              </Button>
            }
          </CardContent>
        </Card>
        <Dialog open={proposalModalOpen} onOpenChange={setProposalModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Proposal Sebelumnya</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {otherProposals.map((proposal, idx) => (
                <div
                  key={proposal.id || idx}
                  className="border rounded-lg p-3 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{proposal.title}</h3>
                      <p className="text-sm text-gray-600">{proposal.companyName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      proposal.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : proposal.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : proposal.status === 'revision'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {proposal.status === 'approved'
                        ? 'Disetujui'
                        : proposal.status === 'rejected'
                        ? 'Ditolak'
                        : proposal.status === 'revision'
                        ? 'Revisi'
                        : 'Menunggu'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button
              className="w-full mt-2"
              variant="outline"
              onClick={() => setProposalModalOpen(false)}
            >
              Tutup
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* ActionCards fitur bawah */}
      <div>
        <ActionCards
          hasActiveProposal={hasActiveProposal}
          hasApprovedProposal={hasApprovedProposal}
          onSubmitProposal={handleSubmitProposal}
          selectedProposal={mainProposal}
        />
      </div>
    </div>
  );
};

export default Dashboard;

