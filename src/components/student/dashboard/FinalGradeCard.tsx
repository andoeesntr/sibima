
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Award } from "lucide-react";

interface FinalGradeCardProps {
  finalGrade: {
    score: number | null;
    breakdown?: {
      supervisor?: number;
      field_supervisor?: number;
    };
  } | null;
}

export function FinalGradeCard({ finalGrade }: FinalGradeCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg font-medium">
          <Award className="mr-2 h-5 w-5 text-primary" />
          Nilai Akhir KP
        </CardTitle>
        <CardDescription>
          Nilai hasil evaluasi pembimbing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {finalGrade ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/30">
              <span className="text-3xl font-bold text-primary">
                {finalGrade.score !== null ? finalGrade.score : "-"}
              </span>
              <span className="text-sm text-muted-foreground">Nilai Akhir</span>
            </div>
            
            {finalGrade.breakdown && (
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-2 border rounded-lg">
                  <div className="font-medium">
                    {finalGrade.breakdown.supervisor !== undefined 
                      ? finalGrade.breakdown.supervisor 
                      : "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">Nilai Pembimbing Akademik</div>
                </div>
                <div className="p-2 border rounded-lg">
                  <div className="font-medium">
                    {finalGrade.breakdown.field_supervisor !== undefined 
                      ? finalGrade.breakdown.field_supervisor 
                      : "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">Nilai Pembimbing Lapangan</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>Belum ada nilai yang diberikan</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
