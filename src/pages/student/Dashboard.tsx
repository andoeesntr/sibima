
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileCheck, FileWarning, User, Users, Building, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Proposal, Student, KpTeam } from '@/types';
import { proposals, teams, students, formatDate } from '@/services/mockData';

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

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [currentUser] = useState<Student>(students[0]);
  const [userTeam, setUserTeam] = useState<KpTeam | null>(null);
  const [teamProposal, setTeamProposal] = useState<Proposal | null>(null);
  
  useEffect(() => {
    // In a real app, fetch this data from an API
    const team = teams.find(t => t.id === currentUser.kpTeamId);
    setUserTeam(team || null);
    
    if (team?.proposalId) {
      const proposal = proposals.find(p => p.id === team.proposalId);
      setTeamProposal(proposal || null);
    }
  }, [currentUser]);

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
            {teamProposal ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Judul KP:</span>
                  <span>{teamProposal.title}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Status:</span>
                  <Badge className={statusColors[teamProposal.status]}>
                    {statusLabels[teamProposal.status]}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Tanggal Pengajuan:</span>
                  <span className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    {formatDate(teamProposal.submissionDate)}
                  </span>
                </div>
                
                {teamProposal.reviewDate && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Tanggal Review:</span>
                    <span className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      {formatDate(teamProposal.reviewDate)}
                    </span>
                  </div>
                )}
                
                {teamProposal.status === 'rejected' && teamProposal.rejectionReason && (
                  <div>
                    <span className="font-medium text-gray-700 block mb-1">Alasan Penolakan:</span>
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">
                      {teamProposal.rejectionReason}
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
          
          {teamProposal && (
            <CardFooter className="flex justify-end">
              <Button 
                className="bg-primary hover:bg-primary/90" 
                onClick={() => navigate('/student/proposal-submission')}
              >
                {teamProposal.status === 'rejected' ? 'Ajukan Ulang' : 'Lihat Detail'}
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
            {userTeam ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Nama Tim:</span>
                  <span>{userTeam.name}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700 block mb-2">Anggota:</span>
                  <div className="space-y-2">
                    {userTeam.members.map(member => (
                      <div key={member.id} className="flex items-center p-2 bg-gray-50 rounded">
                        <User size={16} className="mr-2" />
                        <span>{member.name} ({member.nim})</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700 block mb-2">Pembimbing:</span>
                  <div className="space-y-2">
                    {userTeam.supervisors.map(supervisor => (
                      <div key={supervisor.id} className="flex items-center p-2 bg-gray-50 rounded">
                        <User size={16} className="mr-2" />
                        <span>{supervisor.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
              disabled={!teamProposal || teamProposal.status !== 'approved'}
            >
              {(!teamProposal || teamProposal.status !== 'approved') ? 
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
