import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import KpTimeline from "@/components/coordinator/KpTimeline";
import { StatusSection } from "@/components/student/dashboard/StatusSection";
import { TeamSection } from "@/components/student/dashboard/TeamSection";
import { EvaluationHistorySection } from "@/components/student/dashboard/EvaluationHistorySection";
import { ActionSection } from "@/components/student/dashboard/ActionSection";
import { DocumentPreviewModal } from "@/components/student/dashboard/DocumentPreviewModal";

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

  // For previewing a document
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocName, setPreviewDocName] = useState<string | null>(null);

  // Only show the latest proposal in Riwayat Proposal; others available in dialog
  const latestProposal = proposals.length > 0 ? proposals[0] : null;
  const otherProposals = proposals.length > 1 ? proposals.slice(1) : [];

  // Find only LATEST approved proposal for Status KP
  const approvedProposals = proposals.filter((p) => p.status === "approved");
  const latestApprovedProposal = approvedProposals.length > 0 ? approvedProposals[0] : null;

  const handlePreviewDocument = (url: string, name: string) => {
    setPreviewDocUrl(url);
    setPreviewDocName(name);
  };

  const handleClosePreview = () => {
    setPreviewDocUrl(null);
    setPreviewDocName(null);
  };

  const handleSubmitProposal = () => {
    if (!hasApprovedProposal) navigate('/student/proposal-submission');
  };

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
          <div className="pt-0 pb-0 px-0">
            <KpTimeline readOnly />
          </div>
        </div>
      </section>

      {/* Status KP & Tim KP - 70:30 grid */}
      <section className="grid grid-cols-1 md:grid-cols-10 gap-6 px-0 mt-4" style={{ maxWidth: "100%" }}>
        {/* STATUS KP, 70% */}
        <div className="col-span-1 md:col-span-7">
          <StatusSection
            latestApprovedProposal={latestApprovedProposal}
            evaluations={evaluations}
            onPreviewDocument={handlePreviewDocument}
          />
        </div>
        
        {/* TIM KP, 30% */}
        <div className="col-span-1 md:col-span-3">
          <TeamSection team={lastTeam} />
        </div>
      </section>

      {/* Nilai KP & Riwayat Proposal */}
      <EvaluationHistorySection
        evaluations={evaluations}
        latestProposal={latestProposal}
        otherProposals={otherProposals}
      />

      {/* Akses Cepat */}
      <ActionSection
        hasActiveProposal={hasActiveProposal}
        hasApprovedProposal={hasApprovedProposal}
        mainProposal={mainProposal}
        onSubmitProposal={handleSubmitProposal}
      />

      {/* Preview Document Modal */}
      <DocumentPreviewModal
        isOpen={!!previewDocUrl}
        onClose={handleClosePreview}
        documentUrl={previewDocUrl}
        documentName={previewDocName}
      />
    </div>
  );
};

export default Dashboard;
