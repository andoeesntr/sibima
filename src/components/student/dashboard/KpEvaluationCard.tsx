
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Evaluation } from "@/services/evaluationService";
import React from "react";

interface KpEvaluationCardProps {
  evaluations: Evaluation[];
  noCard?: boolean;
}

// Menampilkan nilai KP jika sudah ada penilaian
export const KpEvaluationCard = ({ evaluations, noCard }: KpEvaluationCardProps) => {
  if (!evaluations || evaluations.length === 0) return (
    <span className="text-gray-500">Belum ada penilaian</span>
  );

  const mainEval = evaluations[0];
  const inner = (
    <div className="flex flex-col gap-1">
      <span className="text-3xl font-bold text-primary">{mainEval?.score ?? "-"} </span>
      <span className="text-gray-600 text-sm">Penilai: {mainEval?.evaluator_type ?? "Koordinator"}</span>
      {/* Jika ada komentar */}
      {mainEval?.comments && (
        <span className="text-muted-foreground text-xs mt-2 italic">
          Catatan: {mainEval.comments}
        </span>
      )}
    </div>
  );

  if (noCard) {
    return inner;
  }

  // Default: pakai Card
  return (
    <Card className="my-4 bg-slate-50">
      <CardHeader>
        <CardTitle className="text-lg">Nilai KP Anda</CardTitle>
      </CardHeader>
      <CardContent>
        {inner}
      </CardContent>
    </Card>
  );
};
