
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from 'lucide-react';

const SupervisorJournalReview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review Logbook Mahasiswa</h2>
        <p className="text-gray-600">Review dan berikan feedback pada jurnal harian mahasiswa</p>
      </div>

      <Card>
        <CardContent className="pt-6 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Fitur review logbook akan segera tersedia</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupervisorJournalReview;
