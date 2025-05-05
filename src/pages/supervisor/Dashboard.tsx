
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Clock, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

interface Proposal {
  id: string;
  title: string;
  status: string;
  submissionDate: string;
  student: {
    id: string;
    full_name: string;
  };
  teamId?: string;
}

interface Student {
  id: string;
  full_name: string;
  nim?: string;
}

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [supervisedProposals, setSupervisedProposals] = useState<Proposal[]>([]);
  const [supervisedStudents, setSupervisedStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch data from Supabase
  useEffect(() => {
    if (user) {
      fetchSupervisorData();
    }
  }, [user]);
  
  const fetchSupervisorData = async () => {
    setIsLoading(true);
    try {
      if (!user?.id) {
        return;
      }
      
      // Fetch proposals supervised by this supervisor with explicit column name for profiles join
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('proposals')
        .select(`
          id,
          title,
          status,
          created_at,
          student_id,
          team_id,
          profiles!student_id (id, full_name)
        `)
        .eq('supervisor_id', user.id);
      
      if (proposalsError) {
        throw proposalsError;
      }
      
      console.log("Retrieved proposals:", proposalsData);
      
      // Transform the data to match our expected Proposal interface
      const formattedProposals: Proposal[] = proposalsData.map(proposal => ({
        id: proposal.id,
        title: proposal.title,
        status: proposal.status || 'submitted',
        submissionDate: proposal.created_at,
        student: proposal.profiles,
        teamId: proposal.team_id,
      }));
      
      setSupervisedProposals(formattedProposals);
      
      // Fetch all students from teams with proposals supervised by this supervisor
      // First get all team IDs
      const teamIds = proposalsData
        .filter(p => p.team_id)
        .map(p => p.team_id);
      
      if (teamIds.length > 0) {
        const { data: teamMembersData, error: teamMembersError } = await supabase
          .from('team_members')
          .select(`
            user_id,
            profiles!user_id (id, full_name, nim)
          `)
          .in('team_id', teamIds);
          
        if (teamMembersError) {
          throw teamMembersError;
        }
        
        const formattedStudents = teamMembersData.map(member => ({
          id: member.profiles.id,
          full_name: member.profiles.full_name,
          nim: member.profiles.nim
        }));
        
        setSupervisedStudents(formattedStudents);
      } else {
        // If no teams, just get the students who directly submitted proposals
        const studentIds = proposalsData.map(p => p.student_id);
        
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('id, full_name, nim')
          .in('id', studentIds);
          
        if (studentsError) {
          throw studentsError;
        }
        
        setSupervisedStudents(studentsData as Student[]);
      }
    } catch (error) {
      console.error('Error fetching supervisor data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Stats calculation
  const stats = {
    totalSupervisedProposals: supervisedProposals.length,
    totalSupervisedStudents: supervisedStudents.length,
    pendingFeedback: supervisedProposals.filter(p => p.status === 'approved').length,
  };
  
  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : supervisedProposals.length > 0 ? (
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
                  <span className="text-sm text-gray-500">
                    Student: {proposal.student?.full_name || 'Unknown'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[proposal.status as keyof typeof statusColors]}>
                    {statusLabels[proposal.status as keyof typeof statusLabels] || proposal.status}
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
