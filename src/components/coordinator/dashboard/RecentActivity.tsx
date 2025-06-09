
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, CheckCircle, FileText, Download, Upload, Edit, UserPlus, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/services/mockData';

interface ActivityLog {
  id: string;
  user_name: string;
  action: string;
  timestamp: string;
}

interface MockActivity {
  id: string;
  user_name: string;
  action: string;
  timestamp: string;
  type: 'proposal' | 'evaluation' | 'download' | 'system' | 'timesheet';
}

const RecentActivity = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock activities untuk demonstrasi
  const mockActivities: MockActivity[] = [
    {
      id: '1',
      user_name: 'Dr. Ahmad Santoso',
      action: 'Menyetujui proposal "Sistem Informasi Manajemen"',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      type: 'proposal'
    },
    {
      id: '2',
      user_name: 'Andi Kurniawan',
      action: 'Mengajukan proposal KP baru',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      type: 'proposal'
    },
    {
      id: '3',
      user_name: 'Prof. Siti Rahayu',
      action: 'Menginput nilai KP untuk mahasiswa',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      type: 'evaluation'
    },
    {
      id: '4',
      user_name: 'Dr. Budi Hartono',
      action: 'Mendownload rekap timesheet mahasiswa',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      type: 'download'
    },
    {
      id: '5',
      user_name: 'Sari Indah',
      action: 'Mengisi timesheet harian',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      type: 'timesheet'
    },
    {
      id: '6',
      user_name: 'Dr. Maya Sari',
      action: 'Meminta revisi proposal "Aplikasi Mobile"',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      type: 'proposal'
    },
    {
      id: '7',
      user_name: 'Riko Pratama',
      action: 'Mengunggah dokumen proposal',
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      type: 'proposal'
    },
    {
      id: '8',
      user_name: 'Dr. Indra Cahya',
      action: 'Menolak proposal "E-commerce Platform"',
      timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
      type: 'proposal'
    }
  ];

  useEffect(() => {
    const fetchActivityLogs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(5);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setActivityLogs(data);
        }
      } catch (error) {
        console.error('Error fetching activity logs:', error);
        // Jika gagal mengambil dari database, gunakan mock data
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLogs();

    // Set up real-time subscription
    const channel = supabase
      .channel('activity_logs_changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'activity_logs' },
          () => {
            fetchActivityLogs();
          })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getActivityIcon = (action: string, type?: string) => {
    if (action.includes('Menyetujui') || action.includes('Disetujui')) {
      return <CheckCircle className="text-green-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    } else if (action.includes('Menolak') || action.includes('Ditolak')) {
      return <XCircle className="text-red-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    } else if (action.includes('revisi') || action.includes('Revisi')) {
      return <Edit className="text-yellow-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    } else if (action.includes('Download') || action.includes('download')) {
      return <Download className="text-blue-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    } else if (action.includes('Mengunggah') || action.includes('upload')) {
      return <Upload className="text-purple-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    } else if (action.includes('Mengajukan') || action.includes('mengajukan')) {
      return <UserPlus className="text-indigo-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    } else if (action.includes('timesheet') || action.includes('Timesheet')) {
      return <Clock className="text-orange-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    } else if (action.includes('nilai') || action.includes('Nilai')) {
      return <FileText className="text-teal-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    } else {
      return <FileText className="text-blue-500 h-5 w-5 flex-shrink-0 mt-0.5" />;
    }
  };

  const displayActivities = activityLogs.length > 0 ? activityLogs : mockActivities.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
        <CardDescription>Aktivitas terkini pada sistem</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && activityLogs.length === 0 ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-5 w-5 rounded-full bg-gray-200 flex-shrink-0 mt-0.5"></div>
                <div className="space-y-1 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayActivities.length > 0 ? (
          displayActivities.map(log => (
            <div key={log.id} className="flex gap-3">
              {getActivityIcon(log.action, (log as MockActivity).type)}
              
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
