
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Clock, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { proposals, students, formatDate } from '@/services/mockData';
import { Student } from '@/types';

const statusColors = {
  draft: "bg-gray-500",
  submitted: "bg-yellow-500",
  reviewed: "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
};

const statusLabels = {
  draft: "Draft",
  submitted: "Diajukan",
  reviewed: "Ditinjau",
  approved: "Disetujui",
  rejected: "Ditolak",
};

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  
  // Filter proposals for this supervisor (we're using the first supervisor's ID)
  const supervisorId = '6';
  const supervisedProposals = proposals.filter(p => 
    p.supervisorIds.includes(supervisorId)
  );
  
  // Get all supervised students
  const supervisedStudents = students.filter(student => {
    // Check if student is part of a team that has a proposal supervised by this supervisor
    const studentTeamIds = supervisedProposals.map(p => p.teamId);
    return 'kpTeamId' in student && studentTeamIds.includes(student.kpTeamId || '');
  });
  
  // Stats
  const stats = {
    totalSupervisedProposals: supervisedProposals.length,
    totalSupervisedStudents: supervisedStudents.length,
    pendingFeedback: supervisedProposals.filter(p => p.status === 'approved' && !p.feedback?.length).length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Dosen Pembimbing</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Proposal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-3xl font-bold">{stats.totalSupervisedProposals}</div>
              <FileText className="ml-auto h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Mahasiswa Bimbingan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-3xl font-bold">{stats.totalSupervisedStudents}</div>
              <Users className="ml-auto h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Menunggu Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-yellow-500">{stats.pendingFeedback}</div>
              <Clock className="ml-auto h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Supervised Proposals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Proposal Bimbingan</CardTitle>
            <CardDescription>Proposal mahasiswa yang Anda bimbing</CardDescription>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/supervisor/feedback')}
          >
            Lihat Semua
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {supervisedProposals.length > 0 ? (
            supervisedProposals.map(proposal => (
              <div 
                key={proposal.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{proposal.title}</span>
                  <span className="text-sm text-gray-500">
                    Submitted: {formatDate(proposal.submissionDate)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[proposal.status]}>
                    {statusLabels[proposal.status]}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => navigate(`/supervisor/feedback?id=${proposal.id}`)}
                  >
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto h-10 w-10 opacity-50 mb-2" />
              <p>Belum ada proposal yang Anda bimbing</p>
            </div>
          )}
        </CardContent>
        {supervisedProposals.length > 0 && (
          <CardFooter>
            <Button 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => navigate('/supervisor/feedback')}
            >
              Berikan Feedback
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {/* Upcoming Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Jadwal Bimbingan</CardTitle>
          <CardDescription>Jadwal bimbingan yang akan datang</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <Calendar className="mx-auto h-10 w-10 opacity-50 mb-2" />
            <p>Belum ada jadwal bimbingan</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            variant="outline"
            onClick={() => navigate('/supervisor/schedule')}
          >
            Buat Jadwal Bimbingan
          </Button>
        </CardFooter>
      </Card>
      
      {/* Digital Signature Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tanda Tangan Digital</CardTitle>
          <CardDescription>Upload tanda tangan digital Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 border border-dashed rounded-lg">
            <div className="text-center">
              <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <p className="text-gray-600 mb-4">
                Upload tanda tangan digital Anda untuk digunakan pada dokumen KP mahasiswa
              </p>
              <Button 
                onClick={() => navigate('/supervisor/digital-signature')}
                className="bg-secondary hover:bg-secondary/90"
              >
                Upload Tanda Tangan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupervisorDashboard;
