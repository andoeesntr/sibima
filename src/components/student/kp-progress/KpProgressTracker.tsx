
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, FileText, Calendar, MessageSquare } from 'lucide-react';
import { useKpProgress } from '@/hooks/useKpProgress';

const KpProgressTracker = () => {
  const { progressData, loading } = useKpProgress();

  const progressStages = [
    {
      key: 'proposal',
      label: 'Proposal',
      description: 'Pengajuan dan persetujuan proposal KP',
      icon: FileText,
      status: progressData?.proposal_status || 'pending'
    },
    {
      key: 'guidance',
      label: 'Bimbingan',
      description: 'Sesi bimbingan dengan dosen pembimbing',
      icon: MessageSquare,
      status: progressData?.guidance_sessions_completed > 0 ? 'in_progress' : 'pending'
    },
    {
      key: 'report',
      label: 'Laporan',
      description: 'Penyusunan laporan KP',
      icon: FileText,
      status: progressData?.report_status || 'not_started'
    },
    {
      key: 'presentation',
      label: 'Sidang',
      description: 'Presentasi dan sidang KP',
      icon: Calendar,
      status: progressData?.presentation_status || 'not_scheduled'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
      case 'scheduled':
        return 'bg-blue-500';
      case 'pending':
      case 'submitted':
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

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      'not_started': 'Belum Dimulai',
      'pending': 'Menunggu',
      'submitted': 'Diajukan',
      'in_progress': 'Sedang Berlangsung',
      'approved': 'Disetujui',
      'revision': 'Perlu Revisi',
      'revision_needed': 'Perlu Revisi',
      'rejected': 'Ditolak',
      'completed': 'Selesai',
      'scheduled': 'Terjadwal',
      'not_scheduled': 'Belum Dijadwalkan'
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  const getProgressPercentage = () => {
    if (!progressData) return 0;
    
    let totalProgress = 0;
    let completedStages = 0;

    // Proposal stage
    if (progressData.proposal_status === 'approved') {
      completedStages += 1;
    } else if (progressData.proposal_status === 'submitted') {
      totalProgress += 0.5;
    }

    // Guidance stage
    if (progressData.guidance_sessions_completed >= 8) {
      completedStages += 1;
    } else if (progressData.guidance_sessions_completed > 0) {
      totalProgress += (progressData.guidance_sessions_completed / 8) * 25;
    }

    // Report stage
    if (progressData.report_status === 'completed') {
      completedStages += 1;
    } else if (progressData.report_status === 'in_progress') {
      totalProgress += 0.5;
    }

    // Presentation stage
    if (progressData.presentation_status === 'completed') {
      completedStages += 1;
    } else if (progressData.presentation_status === 'scheduled') {
      totalProgress += 0.5;
    }

    return Math.min(100, (completedStages * 25) + totalProgress);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Pelacakan Progress KP</h2>
        <p className="text-gray-600">Pantau kemajuan Kerja Praktik Anda</p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Keseluruhan</CardTitle>
          <CardDescription>
            Tahap saat ini: {progressData?.current_stage ? 
              progressStages.find(s => s.key === progressData.current_stage)?.label || progressData.current_stage
              : 'Proposal'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{Math.round(getProgressPercentage())}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Stage Details */}
      <div className="grid gap-4">
        {progressStages.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = stage.status === 'approved' || stage.status === 'completed';
          const isActive = progressData?.current_stage === stage.key;
          
          return (
            <Card key={stage.key} className={isActive ? 'border-blue-500 bg-blue-50' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-100' : isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Icon className={`h-6 w-6 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{stage.label}</h3>
                      <Badge className={getStatusColor(stage.status)}>
                        {getStatusLabel(stage.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{stage.description}</p>
                    
                    {/* Stage-specific details */}
                    {stage.key === 'guidance' && progressData && (
                      <div className="text-sm text-gray-700">
                        <p>Sesi bimbingan: {progressData.guidance_sessions_completed}/8 (minimum)</p>
                        {progressData.guidance_sessions_completed > 0 && (
                          <Progress 
                            value={(progressData.guidance_sessions_completed / 8) * 100} 
                            className="h-2 mt-1" 
                          />
                        )}
                      </div>
                    )}
                    
                    {stage.key === 'proposal' && progressData?.proposal_status === 'revision_needed' && (
                      <div className="flex items-center gap-2 text-orange-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>Proposal memerlukan revisi</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-400">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Aktivitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {progressData?.guidance_sessions_completed || 0}
              </div>
              <div className="text-sm text-gray-600">Sesi Bimbingan</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(getProgressPercentage())}%
              </div>
              <div className="text-sm text-gray-600">Progress Keseluruhan</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {progressData?.last_activity ? 
                  Math.floor((Date.now() - new Date(progressData.last_activity).getTime()) / (1000 * 60 * 60 * 24))
                  : '-'
                }
              </div>
              <div className="text-sm text-gray-600">Hari Terakhir Aktivitas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KpProgressTracker;
