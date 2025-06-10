
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar } from 'lucide-react';
import SupervisorProgressOverview from '@/components/supervisor/kp-progress/SupervisorProgressOverview';
import SupervisorGuidanceManagement from '@/components/supervisor/kp-progress/SupervisorGuidanceManagement';
import { useSupervisorKpProgress } from '@/hooks/useSupervisorKpProgress';

const KpProgressSupervision = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { studentsProgress, totalStudents, loading, refetch } = useSupervisorKpProgress();

  // Set up real-time updates
  useState(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Supervisi Progress KP</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const activeStudents = studentsProgress.filter(s => s.overall_progress > 0).length;
  const completedStudents = studentsProgress.filter(s => s.overall_progress >= 100).length;
  const todayGuidanceCount = studentsProgress.filter(s => s.todayGuidance).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Supervisi Progress KP</h1>
        <Badge variant="outline">
          {totalStudents} mahasiswa bimbingan
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Mahasiswa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">mahasiswa bimbingan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Sedang Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStudents}</div>
            <p className="text-xs text-muted-foreground">mahasiswa aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Bimbingan Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayGuidanceCount}</div>
            <p className="text-xs text-muted-foreground">sesi hari ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs - Only Overview and Guidance */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="guidance" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Bimbingan</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SupervisorProgressOverview />
        </TabsContent>

        <TabsContent value="guidance">
          <SupervisorGuidanceManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KpProgressSupervision;
