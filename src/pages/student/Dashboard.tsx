import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileCheck, FileWarning, User, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { fetchTeamSupervisors } from '@/services/supervisorService';

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
    profile_image?: string;
  } | null;
  company_name?: string | null;
  team?: {
    id: string;
    name: string;
  } | null;
  team_id?: string | null;
}

interface TeamMember {
  id: string;
  full_name: string;
  nim?: string;
  profile_image?: string;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  supervisors: {
    id: string;
    name: string;
    profile_image?: string;
  }[];
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [proposals, setProposals] = useState<ProposalType[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ProposalType | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch all proposals by the student
        const { data: proposalsData, error: proposalsError } = await supabase
          .from('proposals')
          .select(`
            id,
            title,
            status,
            created_at,
            supervisor_id,
            company_name,
            team_id
          `)
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });
        
        if (proposalsError) {
          console.error('Error fetching proposals:', proposalsError);
          toast.error('Gagal memuat data proposal');
          return;
        }
        
        if (!proposalsData || proposalsData.length === 0) {
          setProposals([]);
          setSelectedProposal(null);
          setLoading(false);
          return;
        }

        // Process proposals data
        const processedProposals: ProposalType[] = [];
        
        for (const proposal of proposalsData) {
          let supervisorData = null;
          let teamData = null;
          
          // Fetch supervisor data if exists
          if (proposal.supervisor_id) {
            const { data: supervisor, error: supervisorError } = await supabase
              .from('profiles')
              .select('id, full_name, profile_image')
              .eq('id', proposal.supervisor_id)
              .single();
              
            if (!supervisorError) {
              supervisorData = supervisor;
            }
          }
          
          // Fetch team data if exists
          if (proposal.team_id) {
            const { data: team, error: teamError } = await supabase
              .from('teams')
              .select('id, name')
              .eq('id', proposal.team_id)
              .single();
              
            if (!teamError) {
              teamData = team;
            }
          }
          
          processedProposals.push({
            id: proposal.id,
            title: proposal.title,
            status: proposal.status || 'draft',
            submissionDate: proposal.created_at,
            created_at: proposal.created_at,
            supervisor: supervisorData,
            company_name: proposal.company_name,
            team: teamData,
            team_id: proposal.team_id
          });
        }
        
        setProposals(processedProposals);
        setSelectedProposal(processedProposals[0]);
        
        // Fetch team data for the selected proposal
        let proposalToUseForTeam = processedProposals[0];
        
        // Fetch team members if we have team data
        if (proposalToUseForTeam.team) {
          const teamMembers: TeamMember[] = [];
          
          // Fetch team members using team_members table
          const { data: teamMembersData, error: teamMembersError } = await supabase
            .from('team_members')
            .select(`
              profiles:user_id (id, full_name, nim, profile_image)
            `)
            .eq('team_id', proposalToUseForTeam.team.id);
          
          if (!teamMembersError && teamMembersData) {
            for (const memberData of teamMembersData) {
              if (memberData.profiles) {
                teamMembers.push({
                  id: memberData.profiles.id,
                  full_name: memberData.profiles.full_name || 'Unnamed',
                  nim: memberData.profiles.nim,
                  profile_image: memberData.profiles.profile_image
                });
              }
            }
          }
          
          // If no team members found in the team_members table, add the current user
          if (teamMembers.length === 0 && profile) {
            teamMembers.push({
              id: user.id,
              full_name: profile.full_name || 'Unnamed',
              nim: profile.nim,
              profile_image: profile.profile_image
            });
          }
          
          // Fetch all team supervisors using team_supervisors service
          let supervisors = [];
          if (proposalToUseForTeam.team_id) {
            try {
              const teamSupervisors = await fetchTeamSupervisors(proposalToUseForTeam.team_id);
              supervisors = teamSupervisors.map(supervisor => ({
                id: supervisor.id,
                name: supervisor.full_name,
                profile_image: supervisor.profile_image
              }));
            } catch (error) {
              console.error("Error fetching team supervisors:", error);
              // Fallback to main supervisor if team supervisors fetch fails
              if (proposalToUseForTeam.supervisor) {
                supervisors.push({
                  id: proposalToUseForTeam.supervisor.id,
                  name: proposalToUseForTeam.supervisor.full_name,
                  profile_image: proposalToUseForTeam.supervisor.profile_image
                });
              }
            }
          } else if (proposalToUseForTeam.supervisor) {
            // Fallback if no team_id
            supervisors.push({
              id: proposalToUseForTeam.supervisor.id,
              name: proposalToUseForTeam.supervisor.full_name,
              profile_image: proposalToUseForTeam.supervisor.profile_image
            });
          }
          
          setTeam({
            id: proposalToUseForTeam.team.id,
            name: proposalToUseForTeam.team.name,
            members: teamMembers,
            supervisors: supervisors
          });
        } else {
          // Create a temporary team based on the user
          if (profile) {
            const supervisors = [];
            if (proposalToUseForTeam.supervisor) {
              supervisors.push({
                id: proposalToUseForTeam.supervisor.id,
                name: proposalToUseForTeam.supervisor.full_name,
                profile_image: proposalToUseForTeam.supervisor.profile_image
              });
            }
            
            setTeam({
              id: 'temp-' + proposalToUseForTeam.id,
              name: `Tim ${profile.full_name || 'KP'}`,
              members: [{
                id: user.id,
                full_name: profile.full_name || 'Unnamed',
                nim: profile.nim,
                profile_image: profile.profile_image
              }],
              supervisors: supervisors
            });
          }
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

  const handleSelectProposal = (proposal: ProposalType) => {
    setSelectedProposal(proposal);
  };
  
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
            {proposals.length > 0 ? (
              <>
                {proposals.length > 1 && (
                  <div className="mb-4">
                    <Tabs 
                      value={selectedProposal?.id} 
                      onValueChange={(value) => {
                        const selected = proposals.find(p => p.id === value);
                        if (selected) handleSelectProposal(selected);
                      }}
                    >
                      <TabsList className="grid grid-cols-2 w-full">
                        {proposals.slice(0, 2).map((proposal, index) => (
                          <TabsTrigger key={proposal.id} value={proposal.id}>
                            Proposal {index + 1}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                )}
                
                {selectedProposal && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Judul KP:</span>
                      <span>{selectedProposal.title}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Status:</span>
                      <Badge className={statusColors[selectedProposal.status as keyof typeof statusColors] || "bg-gray-500"}>
                        {statusLabels[selectedProposal.status as keyof typeof statusLabels] || "Unknown"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Tanggal Pengajuan:</span>
                      <span className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        {formatDate(selectedProposal.created_at)}
                      </span>
                    </div>
                    
                    {selectedProposal.company_name && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Perusahaan/Instansi:</span>
                        <span>{selectedProposal.company_name}</span>
                      </div>
                    )}
                    
                    {selectedProposal.reviewDate && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Tanggal Review:</span>
                        <span className="flex items-center">
                          <Clock size={16} className="mr-1" />
                          {formatDate(selectedProposal.reviewDate)}
                        </span>
                      </div>
                    )}
                    
                    {selectedProposal.status === 'rejected' && selectedProposal.rejectionReason && (
                      <div>
                        <span className="font-medium text-gray-700 block mb-1">Alasan Penolakan:</span>
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">
                          {selectedProposal.rejectionReason}
                        </p>
                      </div>
                    )}
                  </>
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
          
          {selectedProposal && (
            <CardFooter className="flex justify-end">
              <Button 
                className="bg-primary hover:bg-primary/90" 
                onClick={() => navigate(`/student/proposal-detail/${selectedProposal.id}`)}
              >
                {selectedProposal.status === 'rejected' ? 'Lihat Detail Penolakan' : 'Lihat Detail Proposal'}
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
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={member.profile_image || "/placeholder.svg"} alt={member.full_name} />
                          <AvatarFallback>{member.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
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
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={supervisor.profile_image || "/placeholder.svg"} alt={supervisor.name} />
                            <AvatarFallback>{supervisor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
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
              disabled={!selectedProposal || selectedProposal.status !== 'approved'}
            >
              {(!selectedProposal || selectedProposal.status !== 'approved') ? 
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
