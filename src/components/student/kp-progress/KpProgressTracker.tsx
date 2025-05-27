
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { useKpProgress } from '@/hooks/useKpProgress';

const KpProgressTracker = () => {
  const { progressData } = useKpProgress();

  const stages = [
    {
      id: 'proposal',
      name: 'Proposal',
      description: 'Pengajuan dan persetujuan proposal KP',
      status: progressData?.proposal_status || 'pending',
      progress: progressData?.current_stage === 'proposal' ? progressData?.overall_progress || 0 : 
                progressData?.current_stage !== 'proposal' ? 100 : 0
    },
    {
      id: 'guidance',
      name: 'Bimbingan',
      description: 'Pelaksanaan bimbingan dengan dosen pembimbing',
      status: progressData?.current_stage === 'guidance' ? 'in_progress' : 
              progressData?.current_stage === 'report' || progressData?.current_stage === 'presentation' ? 'completed' : 'pending',
      progress: progressData?.current_stage === 'guidance' ? progressData?.overall_progress || 0 :
                progressData?.current_stage === 'report' || progressData?.current_stage === 'presentation' ? 100 : 0,
      sessions: progressData?.guidance_sessions_completed || 0
    },
    {
      id: 'report',
      name: 'Laporan',
      description: 'Penyusunan dan review laporan KP',
      status: progressData?.report_status || 'not_started',
      progress: progressData?.current_stage === 'report' ? progressData?.overall_progress || 0 :
                progressData?.current_stage === 'presentation' ? 100 : 0
    },
    {
      id: 'presentation',
      name: 'Sidang',
      description: 'Sidang akhir dan presentasi KP',
      status: progressData?.presentation_status || 'not_scheduled',
      progress: progressData?.current_stage === 'presentation' ? progressData?.overall_progress || 0 : 0
    }
  ];

  const getStatusIcon = (status: string, isActive: boolean) => {
    if (status === 'completed' || status === 'approved') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (isActive || status === 'in_progress' || status === 'draft' || status === 'review') {
      return <Clock className="h-5 w-5 text-blue-500" />;
    } else if (status === 'revision' || status === 'revision_needed') {
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    } else {
      return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-500';
      case 'in_progress':
      case 'draft':
      case 'review':
        return 'bg-blue-500';
      case 'revision':
      case 'revision_needed':
        return 'bg-orange-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string, stageId: string) => {
    const labels: { [key: string]: { [key: string]: string } } = {
      proposal: {
        pending: 'Menunggu Review',
        approved: 'Disetujui',
        revision: 'Perlu Revisi',
        rejected: 'Ditolak'
      },
      guidance: {
        pending: 'Belum Dimulai',
        in_progress: 'Sedang Berlangsung',
        completed: 'Selesai'
      },
      report: {
        not_started: 'Belum Dimulai',
        draft: 'Draft',
        review: 'Dalam Review',
        approved: 'Disetujui'
      },
      presentation: {
        not_scheduled: 'Belum Dijadwalkan',
        scheduled: 'Sudah Dijadwalkan',
        completed: 'Selesai'
      }
    };

    return labels[stageId]?.[status] || status;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Tracking Progress KP</h2>
        <p className="text-gray-600">Pantau progress tahapan KP Anda secara real-time</p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Progress Keseluruhan
          </CardTitle>
          <CardDescription>
            Tahap saat ini: {progressData?.current_stage ? 
              stages.find(s => s.id === progressData.current_stage)?.name : 'Proposal'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress Total</span>
              <span>{progressData?.overall_progress || 0}%</span>
            </div>
            <Progress value={progressData?.overall_progress || 0} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Stage Details */}
      <div className="grid gap-4">
        {stages.map((stage, index) => {
          const isActive = progressData?.current_stage === stage.id;
          const isCompleted = index < stages.findIndex(s => s.id === progressData?.current_stage);
          
          return (
            <Card key={stage.id} className={`${isActive ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(stage.status, isActive)}
                    <div>
                      <CardTitle className="text-lg">{stage.name}</CardTitle>
                      <CardDescription>{stage.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(stage.status)}>
                      {getStatusLabel(stage.status, stage.id)}
                    </Badge>
                    {stage.id === 'guidance' && stage.sessions > 0 && (
                      <Badge variant="outline">
                        {stage.sessions} sesi
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{stage.progress}%</span>
                  </div>
                  <Progress value={stage.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Last Activity */}
      {progressData?.last_activity && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aktivitas Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {new Date(progressData.last_activity).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KpProgressTracker;
