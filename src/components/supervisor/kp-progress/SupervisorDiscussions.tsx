
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from 'lucide-react';

const SupervisorDiscussions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Forum Diskusi</h2>
        <p className="text-gray-600">Kelola diskusi dengan mahasiswa bimbingan</p>
      </div>

      <Card>
        <CardContent className="pt-6 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Fitur forum diskusi akan segera tersedia</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupervisorDiscussions;
