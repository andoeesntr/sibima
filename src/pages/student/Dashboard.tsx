
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
    // isInTeam, // sudah tidak dipakai
    lastTeam,
    evaluations,
  } = useStudentDashboard();

  const [proposalModalOpen, setProposalModalOpen] = useState(false);

  // Ambil proposal terbaru saja untuk riwayat & status
  const latestProposal = proposals.length > 0 ? proposals[0] : null;
  // Proposal lain untuk dialog/riwayat
  const otherProposals = proposals.length > 1 ? proposals.slice(1) : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-0 py-0 space-y-8">
      <h1 className="text-3xl font-bold mt-4 mb-2">Dashboard</h1>
      
      {/* Timeline KP */}
      <section className="rounded-lg border bg-white shadow-sm px-8 pt-7 pb-10 mb-8">
        <KpTimeline readOnly />
      </section>
      
      {/* Status KP, Tim KP, Nilai KP (Single full-width column style) */}
      <section className="space-y-8">
        {/* Status KP */}
        <div className="rounded-lg border bg-white shadow-sm px-8 py-8">
          <StatusCard
            proposals={latestProposal ? [latestProposal] : []}
            selectedProposal={latestProposal}
            onSelectProposal={handleSelectProposal}
            evaluations={evaluations}
          />
        </div>
        {/* Tim KP */}
        <div className="rounded-lg border bg-white shadow-sm px-8 py-8">
          <TeamCard team={lastTeam} />
        </div>
        {/* Nilai KP */}
        <div className="rounded-lg border bg-white shadow-sm px-8 py-8">
          <KpEvaluationCard evaluations={evaluations} />
        </div>
      </section>
      
      {/* Riwayat Proposal (hanya satu terbaru + tombol lihat lainnya) */}
      <section className="rounded-lg border bg-white shadow-sm px-8 py-8">
        <Card className="border-none shadow-none bg-transparent p-0">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl mb-1">Riwayat Proposal</CardTitle>
            <CardDescription>
              Proposal terakhir yang Anda kirimkan
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {latestProposal ? (
              <div className="border rounded-lg p-5 bg-gray-50 mb-3 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-base">{latestProposal.title}</h3>
                  <p className="text-sm text-gray-600">{latestProposal.companyName}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
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
            ) : (
              <p className="text-center text-gray-500 py-8">
                Belum ada proposal yang diajukan
              </p>
            )}
            {otherProposals.length > 0 && (
              <Button
                variant="secondary"
                className="w-full mt-2"
                onClick={() => setProposalModalOpen(true)}
              >
                Lihat Proposal Lain
              </Button>
            )}
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
      </section>

      {/* ActionCards fitur bawah */}
      <section className="rounded-lg border bg-white shadow-sm px-8 py-8 mb-12">
        <ActionCards
          hasActiveProposal={hasActiveProposal}
          hasApprovedProposal={hasApprovedProposal}
          onSubmitProposal={() => {
            if (!hasApprovedProposal) navigate('/student/proposal-submission');
          }}
          selectedProposal={mainProposal}
        />
      </section>
    </div>
  );
};

export default Dashboard;
