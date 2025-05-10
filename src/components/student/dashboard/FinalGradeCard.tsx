
import { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { calculateFinalGrade } from '@/services/evaluationService';
import { useAuth } from '@/contexts/auth';

interface GradeProps {
  score: number;
  breakdown: {[key: string]: number};
}

const FinalGradeCard = () => {
  const { user, profile } = useAuth();
  const [finalGrade, setFinalGrade] = useState<GradeProps | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchGrade = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const result = await calculateFinalGrade(user.id);
        setFinalGrade(result);
      } catch (error) {
        console.error('Error fetching final grade:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGrade();
  }, [user]);
  
  const renderGradeLabel = (score: number) => {
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 40) return 'D';
    return 'E';
  };
  
  if (loading) {
    return (
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Nilai KP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!finalGrade) {
    return (
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Nilai KP</CardTitle>
          <CardDescription>Nilai akhir KP Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Belum ada penilaian</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Nilai KP</CardTitle>
        <CardDescription>Nilai akhir KP Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-3xl font-bold">{finalGrade.score.toFixed(1)}</div>
            <div className="text-lg font-semibold text-gray-600">
              {renderGradeLabel(finalGrade.score)}
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="text-gray-500">
              Akademik: <span className="font-medium">{finalGrade.breakdown.supervisor?.toFixed(1) || '-'}</span>
            </div>
            <div className="text-gray-500">
              Lapangan: <span className="font-medium">{finalGrade.breakdown.field_supervisor?.toFixed(1) || '-'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinalGradeCard;
