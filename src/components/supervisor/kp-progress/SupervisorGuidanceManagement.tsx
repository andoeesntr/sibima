
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from 'lucide-react';

const SupervisorGuidanceManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Manajemen Jadwal Bimbingan</h2>
        <p className="text-gray-600">Kelola jadwal dan approve permintaan bimbingan</p>
      </div>

      <Card>
        <CardContent className="pt-6 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Fitur manajemen jadwal akan segera tersedia</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupervisorGuidanceManagement;
