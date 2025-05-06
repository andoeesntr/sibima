
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ProposalHeader from '@/components/coordinator/proposals/ProposalHeader';
import ProposalDetails from '@/components/coordinator/proposals/ProposalDetails';
import TeamInfo from '@/components/coordinator/proposals/TeamInfo';
import ActionDialogs from '@/components/coordinator/proposals/ActionDialogs';
import DocumentPreview from '@/components/coordinator/proposals/DocumentPreview';
import ProposalActions from '@/components/coordinator/proposals/ProposalActions';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const statusColors = {
  draft: "bg-gray-500",
  submitted: "bg-yellow-500",
  reviewed: "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
};

const statusLabels = {
  draft: "Draft",
  submitted: "Menunggu Review",
  reviewed: "Ditinjau",
  approved: "Disetujui",
  rejected: "Ditolak",
};

interface ProposalDocument {
  id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
}

interface Supervisor {
  id: string;
  full_name: string;
  profile_image?: string;
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
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at?: string;
  student: {
    id: string;
    full_name: string;
  };
  supervisor?: Supervisor;
  company_name?: string;
  team?: Team;
  documents: ProposalDocument[];
  rejectionReason?: string;
}

const ProposalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewName, setPreviewName] = useState('');
  
  // New states for supervisor editing
  const [isEditSupervisorDialogOpen, setIsEditSupervisorDialogOpen] = useState(false);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('');
  
  useEffect(() => {
    const fetchProposalData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch proposal data
        const { data: proposalData, error: proposalError } = await supabase
          .from('proposals')
          .select(`
            id, 
            title,
            description,
            status,
            created_at,
            updated_at,
            company_name,
            team_id,
            supervisor_id,
            rejection_reason,
            supervisor:profiles!supervisor_id(id, full_name, profile_image),
            student:profiles!student_id(id, full_name)
          `)
          .eq('id', id)
          .single();
          
        if (proposalError) {
          console.error("Error fetching proposal:", proposalError);
          throw proposalError;
        }
        
        // Fetch documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('proposal_documents')
          .select('id, file_name, file_url, file_type')
          .eq('proposal_id', id);
        
        if (documentsError) {
          console.error("Error fetching documents:", documentsError);
          throw documentsError;
        }

        // Fetch team data if available
        let teamData = null;
        if (proposalData.team_id) {
          const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('id, name')
            .eq('id', proposalData.team_id)
            .single();
            
          if (teamError) {
            console.error("Error fetching team:", teamError);
          } else if (team) {
            // Fetch team members
            const { data: membersData, error: membersError } = await supabase
              .from('team_members')
              .select(`
                user_id,
                profiles:user_id(id, full_name, nim)
              `)
              .eq('team_id', team.id);
              
            if (membersError) {
              console.error("Error fetching team members:", membersError);
            } else {
              teamData = {
                id: team.id,
                name: team.name,
                members: membersData.map(member => ({
                  id: member.profiles.id,
                  full_name: member.profiles.full_name,
                  nim: member.profiles.nim
                }))
              };
            }
          }
        }

        const fullProposal = {
          ...proposalData,
          team: teamData,
          documents: documentsData || [],
          rejectionReason: proposalData.rejection_reason
        };
        
        setProposal(fullProposal);
        console.log("Fetched proposal data:", fullProposal);
      } catch (error) {
        console.error("Error fetching proposal data:", error);
        toast.error("Failed to load proposal data");
        navigate('/coordinator/proposal-review');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProposalData();
  }, [id, navigate]);

  // Add new function to fetch supervisors
  const fetchSupervisors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'supervisor');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching supervisors:", error);
      return [];
    }
  };

  const handleOpenEditSupervisor = async () => {
    const fetchedSupervisors = await fetchSupervisors();
    setSupervisors(fetchedSupervisors);
    
    if (proposal?.supervisor) {
      setSelectedSupervisorId(proposal.supervisor.id);
    } else {
      setSelectedSupervisorId('');
    }
    
    setIsEditSupervisorDialogOpen(true);
  };

  const handleUpdateSupervisor = async () => {
    if (!proposal || !selectedSupervisorId) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ 
          supervisor_id: selectedSupervisorId,
          updated_at: new Date().toISOString()
        })
        .eq('id', proposal.id);
        
      if (error) throw error;
      
      // Get the supervisor details for the updated proposal
      const { data: supervisorData, error: supervisorError } = await supabase
        .from('profiles')
        .select('id, full_name, profile_image')
        .eq('id', selectedSupervisorId)
        .single();
        
      if (supervisorError) throw supervisorError;
      
      // Update local state
      setProposal({
        ...proposal,
        supervisor: supervisorData
      });
      
      toast.success('Dosen pembimbing berhasil diperbarui');
      setIsEditSupervisorDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating supervisor:", error);
      toast.error(`Failed to update supervisor: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!proposal) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', proposal.id);
        
      if (error) throw error;
      
      toast.success('Proposal berhasil disetujui');
      setIsApproveDialogOpen(false);
      navigate('/coordinator/proposal-review');
    } catch (error: any) {
      console.error("Error approving proposal:", error);
      toast.error(`Failed to approve proposal: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!proposal) return;
    
    if (!rejectionReason.trim()) {
      toast.error('Harap berikan alasan penolakan');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        })
        .eq('id', proposal.id);
        
      if (error) throw error;
      
      toast.success('Proposal berhasil ditolak');
      setIsRejectDialogOpen(false);
      navigate('/coordinator/proposal-review');
    } catch (error: any) {
      console.error("Error rejecting proposal:", error);
      toast.error(`Failed to reject proposal: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewDocument = (url: string, name: string) => {
    setPreviewUrl(url);
    setPreviewName(name);
    setPreviewDialogOpen(true);
  };

  const handleDownloadFile = (url: string, fileName: string) => {
    window.open(url, '_blank');
    toast.success(`Downloading ${fileName}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Proposal tidak ditemukan</h1>
        <Button 
          onClick={() => navigate('/coordinator/proposal-review')}
          variant="outline"
          className="flex items-center"
        >
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProposalHeader 
        title="Detail Proposal" 
        status={proposal.status} 
        statusColors={statusColors}
        statusLabels={statusLabels}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Proposal Details */}
        <div className="md:col-span-2">
          <ProposalDetails
            title={proposal.title}
            createdAt={proposal.created_at}
            description={proposal.description}
            companyName={proposal.company_name}
            rejectionReason={proposal.rejectionReason}
            status={proposal.status}
            documents={proposal.documents}
            onPreviewDocument={handlePreviewDocument}
            onDownloadFile={handleDownloadFile}
          />
          
          <ProposalActions 
            status={proposal.status}
            onApprove={() => setIsApproveDialogOpen(true)}
            onReject={() => setIsRejectDialogOpen(true)}
          />
        </div>
        
        {/* Team & Supervisor Info */}
        <TeamInfo 
          team={proposal.team}
          student={proposal.student}
          supervisor={proposal.supervisor}
          onEditSupervisor={handleOpenEditSupervisor}
          isCoordinator={true}
        />
      </div>
      
      <ActionDialogs
        isApproveDialogOpen={isApproveDialogOpen}
        setIsApproveDialogOpen={setIsApproveDialogOpen}
        isRejectDialogOpen={isRejectDialogOpen}
        setIsRejectDialogOpen={setIsRejectDialogOpen}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        handleApprove={handleApprove}
        handleReject={handleReject}
        isSubmitting={isSubmitting}
      />

      <DocumentPreview
        isOpen={previewDialogOpen}
        setIsOpen={setPreviewDialogOpen}
        url={previewUrl}
        name={previewName}
        onDownload={handleDownloadFile}
      />
      
      {/* Supervisor Edit Dialog */}
      <Dialog open={isEditSupervisorDialogOpen} onOpenChange={setIsEditSupervisorDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Dosen Pembimbing</DialogTitle>
            <DialogDescription>
              Pilih dosen pembimbing untuk proposal ini.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="supervisor-select">Dosen Pembimbing</Label>
              <Select 
                value={selectedSupervisorId} 
                onValueChange={setSelectedSupervisorId}
              >
                <SelectTrigger id="supervisor-select">
                  <SelectValue placeholder="Pilih dosen pembimbing" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map((supervisor) => (
                    <SelectItem key={supervisor.id} value={supervisor.id}>
                      {supervisor.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditSupervisorDialogOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              onClick={handleUpdateSupervisor}
              disabled={isSubmitting || !selectedSupervisorId}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalDetail;
