
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from 'lucide-react';

const SupervisorDocumentReview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review Dokumen</h2>
        <p className="text-gray-600">Review dan berikan feedback pada dokumen mahasiswa</p>
      </div>

      <Card>
        <CardContent className="pt-6 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Fitur review dokumen akan segera tersedia</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupervisorDocumentReview;
