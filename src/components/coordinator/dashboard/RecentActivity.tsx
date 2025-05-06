
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, CheckCircle, FileText } from 'lucide-react';
import { activityLogs, formatDate } from '@/services/mockData';

const RecentActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
        <CardDescription>Aktivitas terkini pada sistem</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activityLogs.slice(0, 5).map(log => (
          <div key={log.id} className="flex gap-3">
            {log.action.includes('Menolak') ? (
              <XCircle className="text-red-500 h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : log.action.includes('Menyetujui') ? (
              <CheckCircle className="text-green-500 h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <FileText className="text-blue-500 h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            
            <div className="space-y-1">
              <p className="text-sm leading-none">
                <span className="font-medium">{log.userName}</span>{' '}
                {log.action}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(log.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {activityLogs.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <p>Belum ada aktivitas</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
