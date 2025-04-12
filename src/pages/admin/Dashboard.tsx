
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRight, FileText, UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { students, supervisors, proposals, activityLogs, formatDate } from '@/services/mockData';

// Fake stats data for chart
const chartData = [
  { name: 'Jan', proposals: 2, users: 5 },
  { name: 'Feb', proposals: 4, users: 8 },
  { name: 'Mar', proposals: 6, users: 10 },
  { name: 'Apr', proposals: 8, users: 15 },
  { name: 'May', proposals: 10, users: 20 },
  { name: 'Jun', proposals: 12, users: 25 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Calculate basic stats
  const stats = {
    totalStudents: students.length,
    totalSupervisors: supervisors.length,
    totalProposals: proposals.length,
    pendingProposals: proposals.filter(p => p.status === 'submitted').length,
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
            <div className="text-3xl font-bold">{stats.totalStudents}</div>
            <Users className="ml-auto h-8 w-8 text-gray-400" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Dosen</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <div className="text-3xl font-bold">{stats.totalSupervisors}</div>
            <Users className="ml-auto h-8 w-8 text-gray-400" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Proposal</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <div className="text-3xl font-bold">{stats.totalProposals}</div>
            <FileText className="ml-auto h-8 w-8 text-gray-400" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Menunggu Review</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <div className="text-3xl font-bold text-yellow-500">{stats.pendingProposals}</div>
            <FileText className="ml-auto h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
      </div>
      
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
            <div className="space-y-4">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                  {log.targetType === 'user' ? (
                    <UserPlus className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <FileText className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
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
            </div>
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
