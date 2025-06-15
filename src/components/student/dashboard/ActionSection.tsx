
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionCards } from "./ActionCards";
import { ProposalType } from "@/types/student";

interface ActionSectionProps {
  hasActiveProposal: boolean;
  hasApprovedProposal: boolean;
  mainProposal: ProposalType | null;
  onSubmitProposal: () => void;
}

export const ActionSection = ({ 
  hasActiveProposal, 
  hasApprovedProposal, 
  mainProposal, 
  onSubmitProposal 
}: ActionSectionProps) => {
  return (
    <section className="w-full mt-4 px-0" style={{ maxWidth: "100%" }}>
      <Card className="rounded-2xl bg-white border shadow-sm w-full">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-xl font-semibold">Akses Cepat</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <ActionCards
            hasActiveProposal={hasActiveProposal}
            hasApprovedProposal={hasApprovedProposal}
            onSubmitProposal={onSubmitProposal}
            selectedProposal={mainProposal}
          />
        </CardContent>
      </Card>
    </section>
  );
};
