
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, MessageSquare, BookOpen, Clock, Upload } from 'lucide-react';
import KpJournal from '@/components/student/kp-progress/KpJournal';
import KpProgressTracker from '@/components/student/kp-progress/KpProgressTracker';
import KpDiscussions from '@/components/student/kp-progress/KpDiscussions';
import KpDocuments from '@/components/student/kp-progress/KpDocuments';
import KpGuidanceSchedule from '@/components/student/kp-progress/KpGuidanceSchedule';
import { useKpProgress } from '@/hooks/useKpProgress';

const KpProgress = () => {
  const [activeTab, setActiveTab] = useState('progress');
  const { progressData, loading } = useKpProgress();

  const getStageLabel = (stage: string) => {
    const stages = {
      proposal: 'Proposal',
      guidance: 'Bimbingan',
      report: 'Laporan',
      presentation: 'Sidang'
    };
    return stages[stage as keyof typeof stages] || stage;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-green-500';
      case 'pending':
      case 'requested':
        return 'bg-yellow-500';
      case 'revision':
      case 'revision_needed':
        return 'bg-orange-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Progress KP</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Progress KP</h1>
        {progressData && (
          <Badge className={getStatusColor(progressData.current_stage)}>
            {getStageLabel(progressData.current_stage)}
          </Badge>
        )}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progress Keseluruhan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={progressData?.overall_progress || 0} className="h-2" />
              <p className="text-sm text-gray-600">{progressData?.overall_progress || 0}% selesai</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sesi Bimbingan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-lg font-semibold">{progressData?.guidance_sessions_completed || 0}</span>
              <span className="text-sm text-gray-600">sesi selesai</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aktivitas Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {progressData?.last_activity 
                ? new Date(progressData.last_activity).toLocaleDateString('id-ID')
                : 'Belum ada aktivitas'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Logbook</span>
          </TabsTrigger>
          <TabsTrigger value="discussions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Diskusi</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Dokumen</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Jadwal</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <KpProgressTracker />
        </TabsContent>

        <TabsContent value="journal">
          <KpJournal />
        </TabsContent>

        <TabsContent value="discussions">
          <KpDiscussions />
        </TabsContent>

        <TabsContent value="documents">
          <KpDocuments />
        </TabsContent>

        <TabsContent value="schedule">
          <KpGuidanceSchedule />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KpProgress;
