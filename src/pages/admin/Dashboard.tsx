
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRight, FileText, UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/services/mockData';
import { supabase } from '@/integrations/supabase/client';
import KpTimeline from '@/components/coordinator/KpTimeline';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSupervisors: 0,
    totalProposals: 0,
    pendingProposals: 0,
  });
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Fetch stats and initial activity logs
  useEffect(() => {
    fetchDashboardData();
    fetchSystemActivityLogs();
  }, []);

  // Setup realtime subscription for system_activity_logs (for "Aktivitas Terbaru")
  useEffect(() => {
    const channel = supabase
      .channel('system_activity_logs_changes_admin')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'system_activity_logs' },
          () => {
            fetchSystemActivityLogs();
            fetchChartData();
          })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch students count
      const { count: studentsCount, error: studentsError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'student');
      if (studentsError) throw studentsError;

      // Fetch supervisors count
      const { count: supervisorsCount, error: supervisorsError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'supervisor');
      if (supervisorsError) throw supervisorsError;
      
      // Fetch proposals count
      const { count: proposalsCount, error: proposalsError } = await supabase
        .from('proposals')
        .select('id', { count: 'exact', head: true });
      if (proposalsError) throw proposalsError;
      
      // Fetch pending proposals count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('proposals')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'submitted');
      if (pendingError) throw pendingError;

      setStats({
        totalStudents: studentsCount || 0,
        totalSupervisors: supervisorsCount || 0,
        totalProposals: proposalsCount || 0,
        pendingProposals: pendingCount || 0,
      });

      // Tak perlu fetch logs/chartData di sini, mereka di-fetch sendiri
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recent system activity logs (Aktivitas Terbaru)
  const fetchSystemActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('system_activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching system activity logs:', error);
        return;
      }
      setActivityLogs(data || []);
    } catch (error) {
      console.error('Error fetching system activity logs:', error);
    }
  };

  // Generate chart data for system activity per month (6 months)
  const fetchChartData = async () => {
    // Ambil data log sistem selama 6 bulan terakhir dan kelompokkan per bulan
    const now = new Date();
    const months: { slug: string; year: number; month: number; name: string }[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        slug: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        name: `${monthNames[d.getMonth()]}`
      });
    }
    try {
      // Supabase belum punya aggregation by month, workaround: fetch all log last 6m, group client-side
      const startDate = `${months[0].year}-${String(months[0].month).padStart(2, '0')}-01`;
      const { data, error } = await supabase
        .from('system_activity_logs')
        .select('id, action_type, timestamp')
        .gte('timestamp', startDate);

      if (error) {
        console.error('Error fetching logs for chart:', error);
        setChartData([]);
        return;
      }

      // Kelompokkan per-bulan: total aktivitas + breakdown proposal/user/upload
      const chart: any[] = months.map((m) => ({
        name: `${m.name} ${m.year}`,
        total: 0,
        proposal: 0,
        user: 0,
        upload: 0,
        timesheet: 0,
        evaluation: 0,
        download: 0,
        system: 0,
      }));

      for (const row of data || []) {
        const t = new Date(row.timestamp);
        const mSlug = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`;
        const mIdx = months.findIndex((m) => m.slug === mSlug);
        if (mIdx !== -1) {
          chart[mIdx].total += 1;
          if (row.action_type === 'proposal_action') chart[mIdx].proposal += 1;
          if (row.action_type === 'user') chart[mIdx].user += 1;
          if (row.action_type === 'upload') chart[mIdx].upload += 1;
          if (row.action_type === 'timesheet') chart[mIdx].timesheet += 1;
          if (row.action_type === 'evaluation') chart[mIdx].evaluation += 1;
          if (row.action_type === 'download') chart[mIdx].download += 1;
          if (row.action_type === 'system') chart[mIdx].system += 1;
        }
      }
      setChartData(chart);

    } catch (error) {
      console.error('Error preparing chart data:', error);
    }
  };

  // Fetch chart data on mount
  useEffect(() => {
    fetchChartData();
  }, []);

  // Icon dan label untuk tipe aktivitas
  const getActivityIcon = (actionType: string, description: string) => {
    if (description.includes('Menyetujui') || description.includes('Disetujui')) {
      return <span title="Approved"><svg className="inline mr-1 h-4 w-4 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></span>;
    } else if (description.includes('Menolak') || description.includes('Ditolak')) {
      return <span title="Rejected"><svg className="inline mr-1 h-4 w-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></span>;
    } else if (description.toLowerCase().includes('revisi')) {
      return <span title="Revision"><svg className="inline mr-1 h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5h2m7 0a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1M9 3h6a2 2 0 0 1 2 2v0H7a2 2 0 0 1 2-2z" /></svg></span>;
    } else if (actionType === 'user') {
      return <UserPlus className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />;
    } else if (actionType === 'upload') {
      return <FileText className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />;
    } else if (actionType === 'download') {
      return <FileText className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />;
    } else if (actionType === 'system') {
      return <FileText className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />;
    } else {
      return <FileText className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Super Admin</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Mahasiswa</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            {isLoading ? (
              <div className="animate-pulse h-8 w-12 bg-gray-300 rounded"></div>
            ) : (
              <div className="text-3xl font-bold">{stats.totalStudents}</div>
            )}
            <Users className="ml-auto h-8 w-8 text-gray-400" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Dosen</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            {isLoading ? (
              <div className="animate-pulse h-8 w-12 bg-gray-300 rounded"></div>
            ) : (
              <div className="text-3xl font-bold">{stats.totalSupervisors}</div>
            )}
            <Users className="ml-auto h-8 w-8 text-gray-400" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Proposal</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            {isLoading ? (
              <div className="animate-pulse h-8 w-12 bg-gray-300 rounded"></div>
            ) : (
              <div className="text-3xl font-bold">{stats.totalProposals}</div>
            )}
            <FileText className="ml-auto h-8 w-8 text-gray-400" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Menunggu Review</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            {isLoading ? (
              <div className="animate-pulse h-8 w-12 bg-gray-300 rounded"></div>
            ) : (
              <div className="text-3xl font-bold text-yellow-500">{stats.pendingProposals}</div>
            )}
            <FileText className="ml-auto h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
      </div>

      {/* Timeline KP Section */}
      <KpTimeline />

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik tren aktivitas sistem */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Aktivitas Sistem (6 bulan terakhir)</CardTitle>
            <CardDescription>
              Grafik tren jumlah semua aktivitas penting di sistem per bulan (proposal, user, upload, dsb).
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#7D3C98" name="Total Aktivitas" />
                <Line type="monotone" dataKey="proposal" stroke="#2C3E50" name="Proposal" />
                <Line type="monotone" dataKey="user" stroke="#138D75" name="User" />
                <Line type="monotone" dataKey="upload" stroke="#884EA0" name="Upload" />
                <Line type="monotone" dataKey="timesheet" stroke="#DC7633" name="Timesheet" />
                <Line type="monotone" dataKey="evaluation" stroke="#17A589" name="Evaluation" />
                <Line type="monotone" dataKey="download" stroke="#2980B9" name="Download" />
                <Line type="monotone" dataKey="system" stroke="#616A6B" name="System" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Recent System Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Aktivitas real-time terkini pada sistem</CardDescription>
          </CardHeader>
          <CardContent className="max-h-80 overflow-auto">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3 pb-3 border-b">
                    <div className="animate-pulse h-5 w-5 bg-blue-300 rounded-full flex-shrink-0 mt-0.5"></div>
                    <div className="flex-1 space-y-1">
                      <div className="animate-pulse h-4 w-3/4 bg-gray-300 rounded"></div>
                      <div className="animate-pulse h-3 w-1/4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activityLogs.length > 0 ? (
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                    {getActivityIcon(log.action_type, log.action_description)}
                    <div className="space-y-1">
                      <p className="text-sm leading-none">
                        <span className="font-medium">{log.user_name}</span>{' '}
                        <span className="text-xs text-gray-500 ml-1">
                          (
                            {log.user_role === 'admin'
                              ? 'Admin'
                              : log.user_role === 'coordinator'
                                ? 'Koordinator'
                                : log.user_role === 'supervisor'
                                  ? 'Dosen'
                                  : log.user_role === 'student'
                                    ? 'Mahasiswa'
                                    : log.user_role}
                          )
                        </span>
                        {' '}
                        {log.action_description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(log.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-10 w-10 opacity-30 mb-2" />
                <p>Belum ada aktivitas yang tercatat</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Manajemen Pengguna</CardTitle>
            <CardDescription>Kelola data pengguna sistem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total mahasiswa</span>
                <Badge variant="outline">{stats.totalStudents}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total dosen</span>
                <Badge variant="outline">{stats.totalSupervisors}</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => navigate('/admin/user-management')}
            >
              Kelola Pengguna <ArrowRight size={14} className="ml-1" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Panduan KP</CardTitle>
            <CardDescription>Kelola dokumen panduan KP</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Upload dan kelola dokumen panduan kerja praktik untuk mahasiswa dan dosen.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => navigate('/admin/guide-management')}
              variant="outline"
            >
              Kelola Panduan <ArrowRight size={14} className="ml-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tanda Tangan Digital</CardTitle>
            <CardDescription>Kelola tanda tangan digital dosen</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Validasi dan kelola tanda tangan digital serta QR Code untuk dokumen KP.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => navigate('/admin/digital-signatures')}
              variant="outline"
            >
              Kelola Tanda Tangan <ArrowRight size={14} className="ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
