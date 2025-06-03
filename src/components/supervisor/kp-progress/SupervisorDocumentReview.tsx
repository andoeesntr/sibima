
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Eye, Download, MessageSquare, Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface KpDocument {
  id: string;
  student_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  status: string;
  supervisor_feedback: string | null;
  version: number;
  created_at: string;
  student?: {
    full_name: string;
    nim: string;
  };
}

const SupervisorDocumentReview = () => {
  const [documents, setDocuments] = useState<KpDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackText, setFeedbackText] = useState<{ [key: string]: string }>({});
  const [submittingFeedback, setSubmittingFeedback] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchDocuments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get students supervised by this supervisor
      const { data: supervisorTeams, error: teamsError } = await supabase
        .from('team_supervisors')
        .select('team_id')
        .eq('supervisor_id', user.id);

      if (teamsError) throw teamsError;

      if (!supervisorTeams || supervisorTeams.length === 0) {
        setDocuments([]);
        return;
      }

      const teamIds = supervisorTeams.map(t => t.team_id);

      // Get students in those teams
      const { data: teamMembers, error: membersError } = await supabase
        .from('team_members')
        .select('user_id')
        .in('team_id', teamIds);

      if (membersError) throw membersError;

      const studentIds = teamMembers?.map(tm => tm.user_id) || [];

      if (studentIds.length === 0) {
        setDocuments([]);
        return;
      }

      // Get documents from those students
      const { data: documentsData, error: docsError } = await supabase
        .from('kp_documents')
        .select(`
          *,
          student:profiles!kp_documents_student_id_fkey (
            full_name,
            nim
          )
        `)
        .in('student_id', studentIds)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;

      setDocuments(documentsData || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Gagal mengambil data dokumen');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (documentId: string, status: string, feedback?: string) => {
    try {
      setSubmittingFeedback(documentId);

      const updateData: any = { status };
      if (feedback) {
        updateData.supervisor_feedback = feedback;
      }

      const { error } = await supabase
        .from('kp_documents')
        .update(updateData)
        .eq('id', documentId);

      if (error) throw error;

      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, status, supervisor_feedback: feedback || doc.supervisor_feedback }
          : doc
      ));

      // Clear feedback text
      setFeedbackText(prev => ({ ...prev, [documentId]: '' }));

      toast.success('Status dokumen berhasil diperbarui');
    } catch (error) {
      console.error('Error updating document status:', error);
      toast.error('Gagal memperbarui status dokumen');
    } finally {
      setSubmittingFeedback(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu Review', className: 'bg-yellow-500' },
      approved: { label: 'Disetujui', className: 'bg-green-500' },
      revision_needed: { label: 'Perlu Revisi', className: 'bg-orange-500' },
      rejected: { label: 'Ditolak', className: 'bg-red-500' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getDocumentTypeLabel = (type: string) => {
    const types = {
      proposal: 'Proposal KP',
      logbook: 'Logbook',
      report_draft: 'Draft Laporan',
      final_report: 'Laporan Akhir',
      presentation: 'Slide Presentasi',
      attachment: 'Lampiran'
    };
    return types[type as keyof typeof types] || type;
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Gagal mengunduh file');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review Dokumen</h2>
        <p className="text-gray-600">Review dan berikan feedback pada dokumen mahasiswa</p>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Belum ada dokumen yang perlu direview</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => (
            <Card key={document.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {getDocumentTypeLabel(document.document_type)}
                      <Badge variant="outline">v{document.version}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center gap-2">
                        <span>{document.student?.full_name} ({document.student?.nim})</span>
                        <span>•</span>
                        <span>{format(new Date(document.created_at), 'dd MMM yyyy', { locale: id })}</span>
                      </div>
                    </CardDescription>
                  </div>
                  {getStatusBadge(document.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">{document.file_name}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(document.file_url, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(document.file_url, document.file_name)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  {document.status === 'pending' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Feedback (Opsional)</label>
                        <Textarea
                          placeholder="Berikan feedback untuk dokumen ini..."
                          value={feedbackText[document.id] || ''}
                          onChange={(e) => setFeedbackText(prev => ({
                            ...prev,
                            [document.id]: e.target.value
                          }))}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(document.id, 'approved', feedbackText[document.id])}
                          disabled={submittingFeedback === document.id}
                        >
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(document.id, 'revision_needed', feedbackText[document.id] || 'Dokumen perlu diperbaiki')}
                          disabled={submittingFeedback === document.id}
                        >
                          Minta Revisi
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(document.id, 'rejected', feedbackText[document.id] || 'Dokumen ditolak')}
                          disabled={submittingFeedback === document.id}
                        >
                          Tolak
                        </Button>
                      </div>
                    </div>
                  )}

                  {document.supervisor_feedback && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800 text-sm">Feedback Anda:</span>
                      </div>
                      <p className="text-blue-700 text-sm">{document.supervisor_feedback}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupervisorDocumentReview;
