import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, FileText, HelpCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { activityLogs, formatDate } from '@/services/mockData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import KpTimeline from '@/components/coordinator/KpTimeline';

interface Proposal {
  id: string;
  title: string;
  status: string;
  submissionDate: string;
  studentName?: string;
}

const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchProposals();
  }, []);
  
  const fetchProposals = async () => {
    try {
      setLoading(true);
      
      // Fetch proposals with student information
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          id,
          title,
          status,
          created_at,
          student:profiles!student_id (full_name)
        `);
      
      if (error) {
        throw error;
      }

      if (data) {
        // Transform data for our component
        const formattedProposals = data.map(proposal => ({
          id: proposal.id,
          title: proposal.title,
          status: proposal.status || 'submitted',
          submissionDate: proposal.created_at,
          studentName: proposal.student?.full_name || 'Unknown Student'
        }));
        
        setProposals(formattedProposals);
        console.log("Fetched proposals:", formattedProposals);
      } else {
        setProposals([]);
      }
    } catch (error: any) {
      console.error("Error fetching proposals:", error);
      toast.error("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  };
  
  const pendingProposals = proposals.filter(p => p.status === 'submitted');
  
  // Calculate stats
  const stats = {
    totalProposals: proposals.length,
    pendingProposals: proposals.filter(p => p.status === 'submitted').length,
    approvedProposals: proposals.filter(p => p.status === 'approved').length,
    rejectedProposals: proposals.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Koordinator KP</h1>
      
      {/* KP Timeline */}
      <KpTimeline />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Proposal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProposals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Menunggu Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats.pendingProposals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Disetujui</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.approvedProposals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats.rejectedProposals}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Pending Proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Proposal Menunggu Review</CardTitle>
              <CardDescription>Proposal yang perlu ditinjau</CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/coordinator/proposal-review')}
            >
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pendingProposals.length > 0 ? (
              pendingProposals.slice(0, 3).map(proposal => (
                <div 
                  key={proposal.id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{proposal.title}</span>
                    <span className="text-sm text-gray-500">
                      Submitted: {formatDate(proposal.submissionDate)}
                    </span>
                    {proposal.studentName && (
                      <span className="text-sm text-gray-500">
                        By: {proposal.studentName}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-500">Menunggu Review</Badge>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => navigate(`/coordinator/proposal-detail/${proposal.id}`)}
                    >
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Tidak ada proposal yang menunggu review</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => navigate('/coordinator/proposal-review')}
            >
              Review Proposal
            </Button>
          </CardFooter>
        </Card>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Aktivitas terkini pada sistem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex gap-3">
                {log.action.includes('Menolak') ? (
                  <XCircle className="text-red-500 h-5 w-5 flex-shrink-0 mt-0.5" />
                ) : log.action.includes('Menyetujui') ? (
                  <CheckCircle className="text-green-500 h-5 w-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <FileText className="text-blue-500 h-5 w-5 flex-shrink-0 mt-0.5" />
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
            
            {activityLogs.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <p>Belum ada aktivitas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
