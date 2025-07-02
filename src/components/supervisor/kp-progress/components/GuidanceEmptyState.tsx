
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from 'lucide-react';

interface GuidanceEmptyStateProps {
  hasAnyRequests: boolean;
}

const GuidanceEmptyState = ({ hasAnyRequests }: GuidanceEmptyStateProps) => {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">
          {!hasAnyRequests 
            ? "Belum ada permintaan bimbingan terjadwal dari mahasiswa" 
            : "Tidak ada permintaan yang sesuai dengan filter"
          }
        </p>
      </CardContent>
    </Card>
  );
};

export default GuidanceEmptyState;
