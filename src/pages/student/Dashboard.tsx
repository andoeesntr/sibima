
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
    lastTeam,
    evaluations,
  } = useStudentDashboard();

  const [proposalModalOpen, setProposalModalOpen] = useState(false);

  // For previewing a document
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocName, setPreviewDocName] = useState<string | null>(null);

  // Only show the latest proposal in Riwayat Proposal; others available in dialog
  const latestProposal = proposals.length > 0 ? proposals[0] : null;
  const otherProposals = proposals.length > 1 ? proposals.slice(1) : [];

  // Find only LATEST approved proposal for Status KP
  const approvedProposals = proposals.filter((p) => p.status === "approved");
  const latestApprovedProposal = approvedProposals.length > 0 ? approvedProposals[0] : null;

  // Documents from proposal/team if available (hanya dari proposal, jika ada)
  const proposalDocs = (latestApprovedProposal && latestApprovedProposal.documents && latestApprovedProposal.documents.length > 0)
    ? latestApprovedProposal.documents
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-0 py-0">
      {/* Timeline KP */}
      <section className="w-full">
        <div className="w-full max-w-7xl mx-auto px-0">
          <div className="pt-10 pb-0 px-0">
            <KpTimeline readOnly />
          </div>
        </div>
      </section>

      {/* Status KP & Tim KP : satu row, lebar sama dengan timeline */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 px-0 mt-4" style={{ maxWidth: "100%" }}>
        {/* STATUS KP */}
        <div>
          <Card className="border rounded-2xl bg-white p-0 shadow-sm h-full flex flex-col justify-between">
            <CardHeader className="p-8 pb-3">
              <CardTitle className="text-2xl font-bold mb-0">Status KP</CardTitle>
              <CardDescription className="text-md text-gray-500">
                Informasi status KP Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 pb-6">
              {/* Status Card */}
              <StatusCard
                proposals={latestApprovedProposal ? [latestApprovedProposal] : []}
                selectedProposal={latestApprovedProposal}
                onSelectProposal={undefined}
                evaluations={evaluations}
              />
              {/* Dokumen Proposal (jika ada) */}
              {proposalDocs.length > 0 && (
                <div className="mt-6">
                  <div className="font-medium mb-2 mt-3">Dokumen Proposal</div>
                  <div className="space-y-2">
                    {proposalDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2 bg-gray-50"
                      >
                        <span className="truncate">{doc.fileName || doc.file_name}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-3"
                          onClick={() => {
                            setPreviewDocUrl(doc.fileUrl || doc.file_url);
                            setPreviewDocName(doc.fileName || doc.file_name);
                          }}
                        >
                          Lihat Dokumen
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* TIM KP */}
        <div>
          <Card className="border rounded-2xl bg-white p-0 shadow-sm h-full flex flex-col justify-between">
            <CardHeader className="p-8 pb-3">
              <CardTitle className="text-2xl font-bold mb-0">Tim KP</CardTitle>
              <CardDescription className="text-md text-gray-500">
                Informasi tim KP Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 pb-6">
              <TeamCard team={lastTeam} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Nilai KP & Riwayat Proposal : satu row, gap lebih rapat & card sejajar */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 px-0 mt-4" style={{ maxWidth: "100%" }}>
        {/* Nilai KP - satu layer */}
        <div>
          <Card className="rounded-2xl bg-white border shadow-sm h-full flex flex-col">
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-xl font-semibold">Nilai KP Anda</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <KpEvaluationCard evaluations={evaluations} noCard />
            </CardContent>
          </Card>
        </div>
        {/* Riwayat Proposal */}
        <div>
          <Card className="rounded-2xl bg-white border shadow-sm h-full flex flex-col">
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-xl font-semibold">Riwayat Proposal</CardTitle>
              <CardDescription>
                Proposal terakhir yang Anda kirimkan
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
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
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Akses Cepat: satu layer full lebar di bawahnya */}
      <section className="w-full mt-4 px-0" style={{ maxWidth: "100%" }}>
        <Card className="rounded-2xl bg-white border shadow-sm w-full">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-xl font-semibold">Akses Cepat</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <ActionCards
              hasActiveProposal={hasActiveProposal}
              hasApprovedProposal={hasApprovedProposal}
              onSubmitProposal={() => {
                if (!hasApprovedProposal) navigate('/student/proposal-submission');
              }}
              selectedProposal={mainProposal}
            />
          </CardContent>
        </Card>
      </section>

      {/* Preview Document Modal */}
      <Dialog open={!!previewDocUrl} onOpenChange={(v) => { if (!v) { setPreviewDocUrl(null); setPreviewDocName(null); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewDocName || "Pratinjau Dokumen"}</DialogTitle>
          </DialogHeader>
          {previewDocUrl ? (
            <iframe
              src={previewDocUrl}
              title={previewDocName || "Dokumen"}
              width="100%"
              height="500"
              className="border rounded-lg"
            />
          ) : (
            <div className="text-gray-500 text-center py-8">Dokumen tidak tersedia.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;

