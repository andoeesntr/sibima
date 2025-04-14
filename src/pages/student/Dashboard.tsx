
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileCheck, FileWarning, User, Users, Calendar } from 'lucide-react';
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

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

interface ProposalType {
  id: string;
  title: string;
  status: string;
  submissionDate?: string;
  created_at: string;
  reviewDate?: string;
  rejectionReason?: string;
  supervisor?: {
    id: string;
    full_name: string;
  } | null;
}

interface TeamMember {
  id: string;
  full_name: string;
  nim?: string;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  supervisors: {
    id: string;
    name: string;
  }[];
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [proposal, setProposal] = useState<ProposalType | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // First fetch the proposal - adding supervisor_id to the select query
        const { data: proposalData, error: proposalError } = await supabase
          .from('proposals')
          .select(`
            id,
            title,
            status,
            created_at,
            supervisor_id
          `)
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (proposalError && proposalError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" which is fine, just means no proposals yet
          console.error('Error fetching proposal:', proposalError);
          toast.error('Gagal memuat data proposal');
        }
        
        let supervisorData = null;
        
        // If we have a proposal and it has a supervisor_id, fetch the supervisor data separately
        if (proposalData && proposalData.supervisor_id) {
          const { data: supervisor, error: supervisorError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', proposalData.supervisor_id)
            .single();
            
          if (!supervisorError) {
            supervisorData = supervisor;
          }
        }
        
        if (proposalData) {
          setProposal({
            id: proposalData.id,
            title: proposalData.title,
            status: proposalData.status,
            submissionDate: proposalData.created_at,
            created_at: proposalData.created_at,
            supervisor: supervisorData
          });
        }
        
        // For now, use the current user's information as the team
        // In a more complete implementation, this would fetch team members from a teams table
        if (profile) {
          const teamData: Team = {
            id: 'team-' + user.id,
            name: `Tim ${profile.full_name || 'KP'}`,
            members: [{
              id: user.id,
              full_name: profile.full_name || 'Student',
              nim: profile.nim
            }],
            supervisors: []
          };
          
          // Add supervisor if we have one from our separate query
          if (supervisorData) {
            teamData.supervisors = [{
              id: supervisorData.id,
              name: supervisorData.full_name
            }];
          }
          
          setTeam(teamData);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, profile]);
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KP Status Card */}
        <Card className="col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Status KP</CardTitle>
            <CardDescription>Informasi tentang status KP Anda saat ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {proposal ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Judul KP:</span>
                  <span>{proposal.title}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Status:</span>
                  <Badge className={statusColors[proposal.status as keyof typeof statusColors] || "bg-gray-500"}>
                    {statusLabels[proposal.status as keyof typeof statusLabels] || "Unknown"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Tanggal Pengajuan:</span>
                  <span className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    {formatDate(proposal.created_at)}
                  </span>
                </div>
                
                {proposal.reviewDate && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Tanggal Review:</span>
                    <span className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      {formatDate(proposal.reviewDate)}
                    </span>
                  </div>
                )}
                
                {proposal.status === 'rejected' && proposal.rejectionReason && (
                  <div>
                    <span className="font-medium text-gray-700 block mb-1">Alasan Penolakan:</span>
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">
                      {proposal.rejectionReason}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <FileWarning className="mx-auto mb-3 text-amber-500" size={40} />
                <p className="text-gray-600">Anda belum mengajukan proposal KP</p>
                <Button 
                  className="mt-4 bg-primary hover:bg-primary/90"
                  onClick={() => navigate('/student/proposal-submission')}
                >
                  Ajukan Proposal
                </Button>
              </div>
            )}
          </CardContent>
          
          {proposal && (
            <CardFooter className="flex justify-end">
              <Button 
                className="bg-primary hover:bg-primary/90" 
                onClick={() => navigate('/student/proposal-submission')}
              >
                {proposal.status === 'rejected' ? 'Ajukan Ulang' : 'Lihat Detail'}
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* KP Team Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Tim KP</CardTitle>
            <CardDescription>Informasi tim KP Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {team ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Nama Tim:</span>
                  <span>{team.name}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700 block mb-2">Anggota:</span>
                  <div className="space-y-2">
                    {team.members.map(member => (
                      <div key={member.id} className="flex items-center p-2 bg-gray-50 rounded">
                        <User size={16} className="mr-2" />
                        <span>{member.full_name} {member.nim ? `(${member.nim})` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {team.supervisors.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700 block mb-2">Pembimbing:</span>
                    <div className="space-y-2">
                      {team.supervisors.map(supervisor => (
                        <div key={supervisor.id} className="flex items-center p-2 bg-gray-50 rounded">
                          <User size={16} className="mr-2" />
                          <span>{supervisor.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <Users className="mx-auto mb-3 text-gray-400" size={40} />
                <p className="text-gray-600">Anda belum memiliki tim KP</p>
                <Button 
                  className="mt-4 bg-primary hover:bg-primary/90"
                  onClick={() => navigate('/student/proposal-submission')}
                >
                  Buat Tim KP
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-center">Pengajuan Proposal</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <FileCheck className="w-12 h-12 mx-auto mb-4 text-primary" />
            <p className="text-sm text-gray-600 mb-4">
              Ajukan proposal kerja praktik Anda atau periksa status pengajuan
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate('/student/proposal-submission')}
            >
              Akses
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-center">Digital Signature</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <FileCheck className="w-12 h-12 mx-auto mb-4 text-secondary" />
            <p className="text-sm text-gray-600 mb-4">
              Download tanda tangan digital dan QR code untuk dokumen KP Anda
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              className="bg-secondary hover:bg-secondary/90"
              onClick={() => navigate('/student/digital-signature')}
              disabled={!proposal || proposal.status !== 'approved'}
            >
              {(!proposal || proposal.status !== 'approved') ? 
                'Belum Tersedia' : 'Akses'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-center">Panduan KP</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <FileCheck className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <p className="text-sm text-gray-600 mb-4">
              Akses panduan dan template dokumen kerja praktik
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="outline"
              onClick={() => navigate('/student/guide')}
            >
              Akses
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
