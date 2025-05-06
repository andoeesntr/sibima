import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProposalHeader from '@/components/student/proposals/ProposalHeader';
import RejectionMessage from '@/components/student/proposals/RejectionMessage';
import ProposalInfo from '@/components/student/proposals/ProposalInfo';
import AttachmentList from '@/components/student/proposals/AttachmentList';
import ProposalFooter from '@/components/student/proposals/ProposalFooter';
import DocumentPreviewDialog from '@/components/student/proposals/DocumentPreviewDialog';
import { formatDate } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  company_name: string | null;
  created_at: string;
  updated_at: string | null;
  rejection_reason?: string;
  supervisor: {
    id: string;
    full_name: string;
    profile_image?: string;
  } | null;
}

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
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
            supervisor_id,
            rejection_reason
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

        // Fetch documents
        const { data: documentData, error: documentError } = await supabase
          .from('proposal_documents')
          .select('id, file_name, file_url, file_type, uploaded_at')
          .eq('proposal_id', id);

        if (documentError) {
          console.error('Error fetching documents:', documentError);
        }

        setProposal({
          ...proposalData,
          supervisor: supervisorData
        });

        setAttachments(documentData || []);
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
      <ProposalHeader status={proposal.status} />

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{proposal.title}</CardTitle>
          <CardDescription>
            Diajukan pada {formatDate(proposal.created_at)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {proposal.status === 'rejected' && proposal.rejection_reason && (
            <RejectionMessage rejectionReason={proposal.rejection_reason} />
          )}

          <ProposalInfo
            companyName={proposal.company_name}
            description={proposal.description}
            createdAt={proposal.created_at}
            updatedAt={proposal.updated_at}
            supervisor={proposal.supervisor}
            formatDate={formatDate}
          />

          <div>
            <h3 className="font-medium mb-3">Lampiran</h3>
            <AttachmentList 
              attachments={attachments} 
              onPreview={handlePreview} 
            />
          </div>
        </CardContent>
        <CardFooter>
          <ProposalFooter status={proposal.status} />
        </CardFooter>
      </Card>

      <DocumentPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        previewUrl={previewUrl}
        previewName={previewName}
      />
    </div>
  );
};

export default ProposalDetail;
