
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusCard } from "./StatusCard";
import { ProposalType } from "@/types/student";
import { Evaluation } from "@/services/evaluationService";
import { useNavigate } from "react-router-dom";

interface StatusSectionProps {
  latestApprovedProposal: ProposalType | null;
  evaluations: Evaluation[];
  onPreviewDocument: (url: string, name: string) => void;
}

export const StatusSection = ({ 
  latestApprovedProposal, 
  evaluations, 
  onPreviewDocument 
}: StatusSectionProps) => {
  const navigate = useNavigate();

  // Documents from proposal if available
  const proposalDocs = (latestApprovedProposal && latestApprovedProposal.documents && latestApprovedProposal.documents.length > 0)
    ? latestApprovedProposal.documents
    : [];

  return (
    <Card className="border rounded-2xl bg-white p-0 shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="p-8 pb-3">
        <CardTitle className="text-2xl font-bold mb-0">Status KP</CardTitle>
        <CardDescription className="text-md text-gray-500">
          Informasi status KP Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0 pb-6">
        <StatusCard
          proposals={latestApprovedProposal ? [latestApprovedProposal] : []}
          selectedProposal={latestApprovedProposal}
          onSelectProposal={undefined}
          evaluations={evaluations}
        />
        
        {/* Dokumen Proposal (jika ada) */}
        {proposalDocs.length > 0 && (
          <div className="mt-4">
            <div className="font-medium mb-2">Dokumen Proposal</div>
            <div className="space-y-2">
              {proposalDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 bg-white"
                >
                  <span className="truncate">{doc.fileName}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-3"
                    onClick={() => onPreviewDocument(doc.fileUrl, doc.fileName)}
                    aria-label="Preview Dokumen"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="text-green-800"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                      <circle cx={12} cy={12} r={3} />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Detail proposal button */}
        {latestApprovedProposal && (
          <div className="flex justify-end mt-4">
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate(`/student/proposal-detail/${latestApprovedProposal.id}`)}
            >
              {latestApprovedProposal.status === 'rejected'
                ? 'Lihat Detail Penolakan'
                : 'Lihat Detail Proposal'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
