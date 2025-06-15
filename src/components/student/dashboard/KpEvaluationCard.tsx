
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Evaluation } from "@/services/evaluationService";

interface KpEvaluationCardProps {
  evaluations: Evaluation[];
}

// Menampilkan nilai KP jika sudah ada penilaian
export const KpEvaluationCard = ({ evaluations }: KpEvaluationCardProps) => {
  // Hanya tampilkan jika ada data nilai
  if (!evaluations || evaluations.length === 0) return null;

  // Misal, tampilkan satu saja (atau rata rata, dsb. - bisa disesuaikan)
  // Kita asumsikan skor ada di field evaluations[i].score
  // Kalau ada lebih dari satu penilaian, bisa di-list atau ditampilkan satu
  const mainEval = evaluations[0];

  return (
    <Card className="my-4 bg-slate-50">
      <CardHeader>
        <CardTitle className="text-lg">Nilai KP Anda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <span className="text-3xl font-bold text-primary">{mainEval?.score ?? "-"} </span>
          <span className="text-gray-600 text-sm">Penilai: {mainEval?.evaluator_name ?? "Koordinator"}</span>
          {/* Jika ada komentar */}
          {mainEval?.comment && (
            <span className="text-muted-foreground text-xs mt-2 italic">
              Catatan: {mainEval.comment}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
