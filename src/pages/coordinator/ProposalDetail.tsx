import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Download, File, User, X, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

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

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
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
  rejectionReason?: string; // Add this property to fix the error
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
          documents: documentsData || []
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
          updated_at: new Date().toISOString()
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
        >
          <ArrowLeft size={16} className="mr-1" /> Kembali ke Daftar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => navigate('/coordinator/proposal-review')}
            variant="outline"
            size="icon"
          >
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-2xl font-bold">Detail Proposal</h1>
        </div>
        
        <Badge className={statusColors[proposal.status as keyof typeof statusColors]}>
          {statusLabels[proposal.status as keyof typeof statusLabels]}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Proposal Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{proposal.title}</CardTitle>
            <CardDescription>
              Submitted: {formatDate(proposal.created_at)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Deskripsi</h3>
              <p className="text-gray-600">{proposal.description}</p>
            </div>
            
            {proposal.company_name && (
              <div>
                <h3 className="font-medium mb-2">Perusahaan/Instansi</h3>
                <p className="text-gray-600">{proposal.company_name}</p>
              </div>
            )}
            
            {proposal.status === 'rejected' && proposal.rejectionReason && (
              <div className="bg-red-50 border border-red-100 rounded-md p-4">
                <h3 className="font-medium text-red-800 mb-1">Alasan Penolakan</h3>
                <p className="text-red-700">{proposal.rejectionReason}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-medium mb-2">Dokumen</h3>
              {proposal.documents.length > 0 ? (
                <div className="space-y-3">
                  {proposal.documents.map(doc => (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-center">
                        <File size={16} className="mr-2 text-blue-500" />
                        <span>{doc.file_name}</span>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mr-2"
                          onClick={() => handlePreviewDocument(doc.file_url, doc.file_name)}
                        >
                          <Eye size={14} className="mr-1" /> Preview
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => handleDownloadFile(doc.file_url, doc.file_name)}
                        >
                          <Download size={14} className="mr-1" /> Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Tidak ada dokumen</p>
              )}
            </div>
          </CardContent>
          
          {proposal.status === 'submitted' && (
            <CardFooter className="flex justify-end space-x-4">
              <Button 
                variant="outline"
                onClick={() => setIsRejectDialogOpen(true)}
              >
                <X size={16} className="mr-1" /> Tolak
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => setIsApproveDialogOpen(true)}
              >
                <Check size={16} className="mr-1" /> Setuju
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Team & Supervisor Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Tim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {proposal.team && (
              <>
                <div>
                  <h3 className="font-medium mb-2">Nama Tim</h3>
                  <p className="text-gray-600">{proposal.team.name}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Anggota Tim</h3>
                  <div className="space-y-2">
                    {proposal.team.members.map(member => (
                      <div 
                        key={member.id}
                        className="flex items-center p-2 bg-gray-50 rounded"
                      >
                        <User size={16} className="mr-2" />
                        <div>
                          <div className="font-medium">{member.full_name}</div>
                          {member.nim && <div className="text-xs text-gray-500">{member.nim}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            <div>
              <h3 className="font-medium mb-2">Mahasiswa</h3>
              <div className="flex items-center p-2 bg-gray-50 rounded">
                <User size={16} className="mr-2" />
                <div className="font-medium">{proposal.student.full_name}</div>
              </div>
            </div>
            
            {proposal.supervisor && (
              <div>
                <h3 className="font-medium mb-2">Dosen Pembimbing</h3>
                <div className="flex items-center p-2 bg-gray-50 rounded">
                  <User size={16} className="mr-2" />
                  <div className="font-medium">{proposal.supervisor.full_name}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui Proposal</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menyetujui proposal ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsApproveDialogOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memproses...' : 'Setujui'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Proposal</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk proposal ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea 
              placeholder="Masukkan alasan penolakan" 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memproses...' : 'Tolak'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Preview: {previewName}</DialogTitle>
            <DialogDescription>
              Preview dokumen
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 h-[60vh] border rounded overflow-hidden">
            <iframe 
              src={previewUrl} 
              title={previewName}
              className="w-full h-full"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => handleDownloadFile(previewUrl, previewName)}
            >
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalDetail;
