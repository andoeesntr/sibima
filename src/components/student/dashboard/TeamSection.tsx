
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TeamCard } from "./TeamCard";
import { TeamType } from "@/types/student";

interface TeamSectionProps {
  team: TeamType | null;
}

export const TeamSection = ({ team }: TeamSectionProps) => {
  return (
    <Card className="border rounded-2xl bg-white p-0 shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="p-8 pb-3">
        <CardTitle className="text-2xl font-bold mb-0">Tim KP</CardTitle>
        <CardDescription className="text-md text-gray-500">
          Informasi tim KP Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0 pb-6">
        <TeamCard team={team} />
      </CardContent>
    </Card>
  );
};
