
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentProgressData {
  student_id: string;
  student_name: string;
  current_stage: string;
  overall_progress: number;
  proposal_status: string;
  guidance_sessions_completed: number;
  report_status: string;
  presentation_status: string;
  last_activity: string;
  pendingReviews: number;
  todayGuidance: boolean;
}

interface SupervisorProgressOverviewProps {
  students: StudentProgressData[];
}

const SupervisorProgressOverview = ({ students }: SupervisorProgressOverviewProps) => {
  const navigate = useNavigate();

  const getStageLabel = (stage: string) => {
    const stages = {
      proposal: 'Proposal',
      guidance: 'Bimbingan',
      report: 'Laporan',
      presentation: 'Sidang'
    };
    return stages[stage as keyof typeof stages] || stage;
  };

  const getStageColor = (stage: string) => {
    const colors = {
      proposal: 'bg-blue-500',
      guidance: 'bg-green-500',
      report: 'bg-orange-500',
      presentation: 'bg-purple-500'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-500';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    if (progress >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatLastActivity = (dateString: string) => {
    if (!dateString) return 'Tidak ada aktivitas';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    return `${Math.floor(diffDays / 30)} bulan lalu`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Overview Progress Mahasiswa</h2>
        <p className="text-gray-600">Pantau progress seluruh mahasiswa bimbingan Anda</p>
      </div>

      <div className="grid gap-4">
        {students.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Belum ada mahasiswa bimbingan</p>
            </CardContent>
          </Card>
        ) : (
          students.map((student) => (
            <Card key={student.student_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {student.student_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatLastActivity(student.last_activity)}
                      </span>
                      <span>{student.guidance_sessions_completed} sesi bimbingan</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStageColor(student.current_stage)}>
                      {getStageLabel(student.current_stage)}
                    </Badge>
                    {student.pendingReviews > 0 && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {student.pendingReviews} review
                      </Badge>
                    )}
                    {student.todayGuidance && (
                      <Badge className="bg-green-500 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Hari ini
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progress Keseluruhan</span>
                      <span className={`text-sm font-semibold ${getProgressColor(student.overall_progress)}`}>
                        {student.overall_progress}%
                      </span>
                    </div>
                    <Progress value={student.overall_progress} className="h-2" />
                  </div>

                  {/* Status Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Proposal</div>
                      <Badge 
                        variant="outline" 
                        className={`mt-1 ${
                          student.proposal_status === 'approved' ? 'text-green-600' :
                          student.proposal_status === 'revision' ? 'text-orange-600' :
                          student.proposal_status === 'rejected' ? 'text-red-600' : 'text-gray-600'
                        }`}
                      >
                        {student.proposal_status === 'approved' ? 'Disetujui' :
                         student.proposal_status === 'revision' ? 'Revisi' :
                         student.proposal_status === 'rejected' ? 'Ditolak' : 'Pending'}
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Bimbingan</div>
                      <div className="mt-1 text-blue-600 font-semibold">
                        {student.guidance_sessions_completed} sesi
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Laporan</div>
                      <Badge 
                        variant="outline" 
                        className={`mt-1 ${
                          student.report_status === 'approved' ? 'text-green-600' :
                          student.report_status === 'review' ? 'text-orange-600' :
                          student.report_status === 'draft' ? 'text-blue-600' : 'text-gray-600'
                        }`}
                      >
                        {student.report_status === 'approved' ? 'Disetujui' :
                         student.report_status === 'review' ? 'Review' :
                         student.report_status === 'draft' ? 'Draft' : 'Belum'}
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Sidang</div>
                      <Badge 
                        variant="outline" 
                        className={`mt-1 ${
                          student.presentation_status === 'completed' ? 'text-green-600' :
                          student.presentation_status === 'scheduled' ? 'text-blue-600' : 'text-gray-600'
                        }`}
                      >
                        {student.presentation_status === 'completed' ? 'Selesai' :
                         student.presentation_status === 'scheduled' ? 'Terjadwal' : 'Belum'}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/supervisor/kp-progress?student=${student.student_id}&tab=journal`)}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Lihat Detail
                    </Button>
                    {student.pendingReviews > 0 && (
                      <Button 
                        size="sm"
                        onClick={() => navigate(`/supervisor/kp-progress?student=${student.student_id}&tab=documents`)}
                      >
                        Review ({student.pendingReviews})
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SupervisorProgressOverview;
