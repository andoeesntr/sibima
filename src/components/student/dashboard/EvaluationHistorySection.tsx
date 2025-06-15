
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KpEvaluationCard } from "./KpEvaluationCard";
import { ProposalType } from "@/types/student";
import { Evaluation } from "@/services/evaluationService";

interface EvaluationHistorySectionProps {
  evaluations: Evaluation[];
  latestProposal: ProposalType | null;
  otherProposals: ProposalType[];
}

export const EvaluationHistorySection = ({ 
  evaluations, 
  latestProposal, 
  otherProposals 
}: EvaluationHistorySectionProps) => {
  const [proposalModalOpen, setProposalModalOpen] = useState(false);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 px-0 mt-4" style={{ maxWidth: "100%" }}>
      {/* Nilai KP */}
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
  );
};
