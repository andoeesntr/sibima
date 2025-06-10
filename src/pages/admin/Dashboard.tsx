
import { useState, useEffect } from 'react';
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
  
  useEffect(() => {
    fetchDashboardData();
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

      // Fetch recent activity logs
      const { data: logs, error: logsError } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);
      
      if (logsError) throw logsError;

      // Generate chart data for the past 6 months
      const chartData = generateChartData();

      setStats({
        totalStudents: studentsCount || 0,
        totalSupervisors: supervisorsCount || 0,
        totalProposals: proposalsCount || 0,
        pendingProposals: pendingCount || 0,
      });
      
      setActivityLogs(logs || []);
      setChartData(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate fake chart data for now
  const generateChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((name, index) => ({
      name,
      proposals: Math.floor(Math.random() * 10) + 2 + index,
      users: Math.floor(Math.random() * 15) + 5 + index,
    }));
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
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Aktivitas Sistem</CardTitle>
            <CardDescription>Trend penggunaan sistem dalam 6 bulan terakhir</CardDescription>
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
                <Line type="monotone" dataKey="proposals" stroke="#2C3E50" activeDot={{ r: 8 }} name="Proposal" />
                <Line type="monotone" dataKey="users" stroke="#27AE60" name="Pengguna" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Aktivitas terkini pada sistem</CardDescription>
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
                    {log.target_type === 'user' ? (
                      <UserPlus className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <FileText className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
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
