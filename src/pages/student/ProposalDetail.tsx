import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, User, ArrowLeft, Download, Clock, FileCheck, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

interface Proposal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  company_name: string | null;
  created_at: string;
  updated_at: string | null;
  supervisor: {
    id: string;
    full_name: string;
    profile_image?: string;
  } | null;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

const ProposalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewName, setPreviewName] = useState('');

  useEffect(() => {
    const fetchProposal = async () => {
      if (!user || !id) return;

      setLoading(true);
      try {
        const { data: proposalData, error: proposalError } = await supabase
          .from('proposals')
          .select(`
            id,
            title,
            description,
            status,
            company_name,
            created_at,
            updated_at,
            supervisor_id
          `)
          .eq('id', id)
          .eq('student_id', user.id)
          .single();

        if (proposalError) {
          console.error('Error fetching proposal:', proposalError);
          toast.error('Gagal memuat data proposal');
          navigate('/student');
          return;
        }

        let supervisorData = null;
        if (proposalData.supervisor_id) {
          const { data: supervisor, error: supervisorError } = await supabase
            .from('profiles')
            .select('id, full_name, profile_image')
            .eq('id', proposalData.supervisor_id)
            .single();
            
          if (!supervisorError) {
            supervisorData = supervisor;
          }
        }

        setProposal({
          ...proposalData,
          supervisor: supervisorData
        });

        setAttachments([
          { 
            id: '1', 
            name: 'proposal_kp.pdf', 
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
            type: 'pdf' 
          },
          { 
            id: '2', 
            name: 'surat_persetujuan.pdf', 
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
            type: 'pdf' 
          }
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id, user, navigate]);

  const handlePreview = (url: string, name: string) => {
    setPreviewUrl(url);
    setPreviewName(name);
    setPreviewDialogOpen(true);
  };

  const handleDownload = (url: string, filename: string) => {
    window.open(url, '_blank');
    toast.success(`Downloading ${filename}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-800">Proposal tidak ditemukan</h2>
        <p className="mt-2 text-gray-600">Proposal yang Anda cari tidak dapat ditemukan atau Anda tidak memiliki akses.</p>
        <Button 
          className="mt-6"
          onClick={() => navigate('/student')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/student')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
        <Badge className={statusColors[proposal.status as keyof typeof statusColors] || "bg-gray-500"}>
          {statusLabels[proposal.status as keyof typeof statusLabels] || "Unknown"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{proposal.title}</CardTitle>
          <CardDescription>
            Diajukan pada {formatDate(proposal.created_at)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {proposal.company_name && (
            <div>
              <h3 className="font-medium mb-2">Nama Perusahaan</h3>
              <p className="text-gray-700">{proposal.company_name}</p>
            </div>
          )}

          {proposal.description && (
            <div>
              <h3 className="font-medium mb-2">Deskripsi Kerja Praktik</h3>
              <p className="text-gray-700 whitespace-pre-line">{proposal.description}</p>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Informasi Proposal</h3>
            <dl className="space-y-2">
              <div className="flex items-center">
                <dt className="w-40 flex items-center text-gray-600">
                  <Calendar size={16} className="mr-2" /> Tanggal Pengajuan
                </dt>
                <dd>{formatDate(proposal.created_at)}</dd>
              </div>
              
              {proposal.updated_at && proposal.updated_at !== proposal.created_at && (
                <div className="flex items-center">
                  <dt className="w-40 flex items-center text-gray-600">
                    <Clock size={16} className="mr-2" /> Terakhir Diperbarui
                  </dt>
                  <dd>{formatDate(proposal.updated_at)}</dd>
                </div>
              )}
              
              <div className="flex items-center">
                <dt className="w-40 flex items-center text-gray-600">
                  <User size={16} className="mr-2" /> Dosen Pembimbing
                </dt>
                <dd className="flex items-center">
                  {proposal.supervisor ? (
                    <>
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={proposal.supervisor.profile_image || "/placeholder.svg"} alt={proposal.supervisor.full_name} />
                        <AvatarFallback>{proposal.supervisor.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {proposal.supervisor.full_name}
                    </>
                  ) : (
                    <span className="text-gray-500">Belum ditentukan</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="font-medium mb-3">Lampiran</h3>
            {attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <FileText size={18} className="mr-2 text-primary" />
                      <span>{attachment.name}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePreview(attachment.url, attachment.name)}
                      >
                        <Eye size={16} className="mr-1" /> Preview
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownload(attachment.url, attachment.name)}
                      >
                        <Download size={16} className="mr-1" /> Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Tidak ada lampiran tersedia</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {proposal.status === 'approved' && (
              <Button 
                onClick={() => navigate('/student/digital-signature')}
                className="bg-secondary hover:bg-secondary/90"
              >
                <FileCheck className="mr-2 h-4 w-4" /> Akses Digital Signature
              </Button>
            )}
          </div>
          {proposal.status === 'rejected' && (
            <Button onClick={() => navigate('/student/proposal-submission')}>
              Ajukan Ulang Proposal
            </Button>
          )}
        </CardFooter>
      </Card>

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
              src={previewUrl || ''} 
              title={previewName}
              className="w-full h-full"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => previewUrl && handleDownload(previewUrl, previewName)}
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
