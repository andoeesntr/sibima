
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, CheckCircle, FileText, Download, Upload, Edit, UserPlus, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/services/mockData';

interface SystemActivityLog {
  id: string;
  user_name: string;
  user_role: string;
  action_type: string;
  action_description: string;
  target_type: string | null;
  target_id: string | null;
  metadata: any;
  timestamp: string;
}

const RecentActivity = () => {
  const [activityLogs, setActivityLogs] = useState<SystemActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemActivityLogs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('system_activity_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching system activity logs:', error);
          throw error;
        }

        if (data && data.length > 0) {
          setActivityLogs(data);
        }
      } catch (error) {
        console.error('Error fetching system activity logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemActivityLogs();

    // Set up real-time subscription for system activity logs
    const channel = supabase
      .channel('system_activity_logs_changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'system_activity_logs' },
          () => {
            fetchSystemActivityLogs();
          })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getActivityIcon = (actionType: string, actionDescription: string) => {
    if (actionDescription.includes('Menyetujui') || actionDescription.includes('Disetujui')) {
      return <CheckCircle className="text-green-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    } else if (actionDescription.includes('Menolak') || actionDescription.includes('Ditolak')) {
      return <XCircle className="text-red-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    } else if (actionDescription.includes('revisi') || actionDescription.includes('Revisi')) {
      return <Edit className="text-yellow-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    } else if (actionDescription.includes('Download') || actionDescription.includes('download')) {
      return <Download className="text-blue-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    } else if (actionDescription.includes('Mengunggah') || actionDescription.includes('upload')) {
      return <Upload className="text-purple-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    } else if (actionDescription.includes('Mengajukan') || actionDescription.includes('mengajukan')) {
      return <UserPlus className="text-indigo-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    } else if (actionType === 'timesheet' || actionDescription.includes('timesheet')) {
      return <Clock className="text-orange-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    } else if (actionType === 'evaluation' || actionDescription.includes('nilai')) {
      return <FileText className="text-teal-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    } else {
      return <FileText className="text-blue-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'coordinator': return 'Koordinator';
      case 'supervisor': return 'Dosen Pembimbing';
      case 'student': return 'Mahasiswa';
      case 'admin': return 'Admin';
      default: return role;
    }
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-5 w-5 rounded-full bg-gray-200 flex-shrink-0 mt-0.5"></div>
                <div className="space-y-1 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activityLogs.length > 0 ? (
          activityLogs.map(log => (
            <div key={log.id} className="flex gap-3">
              {getActivityIcon(log.action_type, log.action_description)}
              
              <div className="space-y-1">
                <p className="text-sm leading-none">
                  <span className="font-medium">{log.user_name}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({getRoleLabel(log.user_role)})
                  </span>
                  {' '}
                  {log.action_description}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(log.timestamp)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>Belum ada aktivitas sistem</p>
            <p className="text-xs mt-1">Aktivitas akan muncul ketika ada aksi pada sistem</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
