
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, CheckCircle, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  target_type: string;
  target_id?: string;
  timestamp: string;
}

const RecentActivity = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      setActivityLogs(data || []);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
        <CardDescription>Aktivitas terkini pada sistem</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-1 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activityLogs.length > 0 ? (
          activityLogs.map(log => (
            <div key={log.id} className="flex gap-3">
              {log.action.includes('menolak') ? (
                <XCircle className="text-red-500 h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : log.action.includes('menyetujui') || log.action.includes('approve') ? (
                <CheckCircle className="text-green-500 h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : (
                <FileText className="text-blue-500 h-5 w-5 flex-shrink-0 mt-0.5" />
              )}
              
              <div className="space-y-1">
                <p className="text-sm leading-none">
                  <span className="font-medium">{log.user_name}</span>{' '}
                  {log.action}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(log.timestamp)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>Belum ada aktivitas</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
