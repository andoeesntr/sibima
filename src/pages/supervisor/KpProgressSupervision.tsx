
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, FileText, MessageSquare, Calendar } from 'lucide-react';
import SupervisorJournalReview from '@/components/supervisor/kp-progress/SupervisorJournalReview';
import SupervisorProgressOverview from '@/components/supervisor/kp-progress/SupervisorProgressOverview';
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
        <h1 className="text-2xl font-semibold">Pemantauan Progress KP</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Pemantauan Progress KP</h1>
        <Badge variant="outline" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {totalStudents} Mahasiswa Bimbingan
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{totalStudents}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold">
                {studentsProgress.filter(s => s.pendingReviews > 0).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bimbingan Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">
                {studentsProgress.filter(s => s.todayGuidance).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-2xl font-bold">
                {totalStudents > 0 
                  ? Math.round(studentsProgress.reduce((sum, s) => sum + s.overall_progress, 0) / totalStudents)
                  : 0
                }%
              </span>
            </div>
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
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Review Logbook</span>
          </TabsTrigger>
          <TabsTrigger value="discussions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Diskusi</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Dokumen</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Jadwal</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SupervisorProgressOverview students={studentsProgress} />
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

        <TabsContent value="schedule">
          <SupervisorGuidanceManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KpProgressSupervision;
