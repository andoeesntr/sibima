
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusCard } from "@/components/student/dashboard/StatusCard";
import { TeamCard } from "@/components/student/dashboard/TeamCard";
import { ActionCards } from "@/components/student/dashboard/ActionCards";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { useNavigate } from "react-router-dom";
// Import timeline KP coordinator version
import KpTimeline from "@/components/coordinator/KpTimeline";

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    proposals,
    mainProposal,
    team,
    loading,
    handleSelectProposal,
    hasActiveProposal,
    hasApprovedProposal,
    isInTeam,
    lastTeam,
    evaluations
  } = useStudentDashboard();

  const handleSubmitProposal = () => {
    if (hasApprovedProposal) {
      return; // Tidak melakukan apa-apa jika sudah ada proposal yang disetujui
    }
    navigate('/student/proposal-submission');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Mahasiswa</h1>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="proposals">Proposal</TabsTrigger>
          {isInTeam && <TabsTrigger value="team">Tim</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Pindahkan ActionCards ke bawah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatusCard 
              proposals={mainProposal ? [mainProposal] : []}
              selectedProposal={mainProposal}
              onSelectProposal={handleSelectProposal}
              evaluations={evaluations}
            />
            {lastTeam && <TeamCard team={lastTeam} />}
          </div>
          {/* Timeline Kerja Praktek */}
          <div>
            <KpTimeline />
          </div>
          {/* ActionCards di bawah */}
          <div>
            <ActionCards 
              hasActiveProposal={hasActiveProposal}
              hasApprovedProposal={hasApprovedProposal}
              onSubmitProposal={handleSubmitProposal}
              selectedProposal={mainProposal}
            />
          </div>
        </TabsContent>

        <TabsContent value="proposals">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Proposal</CardTitle>
              <CardDescription>
                Daftar semua proposal yang pernah Anda ajukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {proposals.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Belum ada proposal yang diajukan
                </p>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal, index) => (
                    <div 
                      key={proposal.id || index}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSelectProposal(proposal)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{proposal.title}</h3>
                          <p className="text-sm text-gray-600">{proposal.companyName}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          proposal.status === 'approved' ? 'bg-green-100 text-green-800' :
                          proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          proposal.status === 'revision' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {proposal.status === 'approved' ? 'Disetujui' :
                           proposal.status === 'rejected' ? 'Ditolak' :
                           proposal.status === 'revision' ? 'Revisi' : 'Menunggu'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {isInTeam && (
          <TabsContent value="team">
            {lastTeam && <TeamCard team={lastTeam} />}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Dashboard;

