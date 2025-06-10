
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, MessageSquare, Calendar, FileText } from 'lucide-react';
import SupervisorProgressOverview from '@/components/supervisor/kp-progress/SupervisorProgressOverview';
import SupervisorJournalReview from '@/components/supervisor/kp-progress/SupervisorJournalReview';
import SupervisorDiscussions from '@/components/supervisor/kp-progress/SupervisorDiscussions';
import SupervisorDocumentReview from '@/components/supervisor/kp-progress/SupervisorDocumentReview';
import SupervisorGuidanceManagement from '@/components/supervisor/kp-progress/SupervisorGuidanceManagement';
import { useSupervisorKpProgress } from '@/hooks/useSupervisorKpProgress';

const KpProgressSupervision = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { studentsProgress, totalStudents, loading } = useSupervisorKpProgress();

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
  const pendingReviews = studentsProgress.reduce((total, s) => total + s.pendingReviews, 0);
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <BookOpen className="h-4 w-4" />
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
              <FileText className="h-4 w-4" />
              Menunggu Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReviews}</div>
            <p className="text-xs text-muted-foreground">dokumen pending</p>
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

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Jurnal</span>
          </TabsTrigger>
          <TabsTrigger value="discussions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Diskusi</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Dokumen</span>
          </TabsTrigger>
          <TabsTrigger value="guidance" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Bimbingan</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SupervisorProgressOverview />
        </TabsContent>

        <TabsContent value="journal">
          <SupervisorJournalReview />
        </TabsContent>

        <TabsContent value="discussions">
          <SupervisorDiscussions />
        </TabsContent>

        <TabsContent value="documents">
          <SupervisorDocumentReview />
        </TabsContent>

        <TabsContent value="guidance">
          <SupervisorGuidanceManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KpProgressSupervision;
