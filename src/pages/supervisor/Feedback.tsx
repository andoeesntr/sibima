import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Check, Download, Eye, FileText, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProposals, Proposal } from '@/hooks/useProposals';

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

const SupervisorFeedback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get('id');
  const { user } = useAuth();
  
  const { proposals, loading: proposalsLoading, saveFeedback } = useProposals();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('detail');
  
  useEffect(() => {
    if (proposalId && proposals.length > 0) {
      const selected = proposals.find(p => p.id === proposalId);
      if (selected) {
        setSelectedProposal(selected);
      }
    } else if (proposals.length > 0 && !selectedProposal) {
      setSelectedProposal(proposals[0]);
    }
  }, [proposalId, proposals, selectedProposal]);

  const handleSelectProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
  };

  const handleSendFeedback = async () => {
    if (!feedback.trim()) {
      toast.error('Harap masukkan feedback');
      return;
    }

    if (!selectedProposal?.id || !user?.id) {
      toast.error('Tidak dapat mengirim feedback');
      return;
    }

    setIsSubmitting(true);

    try {
      await saveFeedback(selectedProposal.id, user.id, feedback);
      setIsFeedbackDialogOpen(false);
      setFeedback('');
      toast.success('Feedback berhasil dikirim');
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast.error('Gagal mengirim feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadFile = (url: string, fileName: string) => {
    window.open(url, '_blank');
    toast.success(`Downloading ${fileName}`);
  };

  const handlePreviewFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => navigate('/supervisor')}
            variant="outline"
            size="icon"
          >
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-2xl font-bold">Feedback Proposal KP</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Proposals List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Daftar Proposal</CardTitle>
            <CardDescription>
              Proposal mahasiswa yang Anda bimbing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {proposalsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {proposals.length > 0 ? (
                  proposals.map(proposal => (
                    <div 
                      key={proposal.id}
                      className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedProposal?.id === proposal.id ? 'bg-primary/5 border-primary' : ''
                      }`}
                      onClick={() => handleSelectProposal(proposal)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium truncate">{proposal.title}</div>
                        <Badge className={statusColors[proposal.status as keyof typeof statusColors]}>
                          {statusLabels[proposal.status as keyof typeof statusLabels] || proposal.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(proposal.submissionDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Mahasiswa: {proposal.studentName || 'Unknown'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>Belum ada proposal yang Anda bimbing</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Proposal Detail */}
        {selectedProposal ? (
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{selectedProposal.title}</CardTitle>
                <CardDescription>
                  Diajukan: {formatDate(selectedProposal.submissionDate)}
                </CardDescription>
              </div>
              <Badge className={statusColors[selectedProposal.status as keyof typeof statusColors]}>
                {statusLabels[selectedProposal.status as keyof typeof statusLabels] || selectedProposal.status}
              </Badge>
            </CardHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 px-6">
                <TabsTrigger value="detail">Detail</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
              </TabsList>
              
              <TabsContent value="detail">
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Deskripsi</h3>
                    <p className="text-gray-600">{selectedProposal.description || 'Tidak ada deskripsi'}</p>
                  </div>
                  
                  {selectedProposal.rejectionReason && selectedProposal.status === 'rejected' && (
                    <div className="bg-red-50 border border-red-100 rounded-md p-4">
                      <h3 className="font-medium text-red-800 mb-1">Alasan Penolakan</h3>
                      <p className="text-red-700">{selectedProposal.rejectionReason}</p>
                    </div>
                  )}
                  
                  {selectedProposal.teamId && (
                    <div>
                      <h3 className="font-medium mb-2">Tim KP</h3>
                      <p className="text-gray-600">{selectedProposal.teamName || 'Tim KP'}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium mb-2">Pembimbing</h3>
                    {selectedProposal.supervisors && selectedProposal.supervisors.length > 0 ? (
                      <div className="space-y-2">
                        {selectedProposal.supervisors.map((supervisor, index) => (
                          <div key={supervisor.id} className="flex items-center p-2 bg-gray-50 rounded">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                              {supervisor.profile_image ? (
                                <img src={supervisor.profile_image} alt={supervisor.full_name} className="w-8 h-8 rounded-full" />
                              ) : (
                                <span className="text-xs">{supervisor.full_name.charAt(0)}</span>
                              )}
                            </div>
                            <span>{supervisor.full_name}</span>
                            <span className="ml-auto text-xs text-gray-500">Pembimbing {index + 1}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Belum ada pembimbing</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Dokumen</h3>
                    {selectedProposal.documents && selectedProposal.documents.length > 0 ? (
                      <div className="space-y-3">
                        {selectedProposal.documents.map((doc) => (
                          <div 
                            key={doc.id}
                            className="flex items-center justify-between p-3 border rounded-md"
                          >
                            <div className="flex items-center">
                              <FileText size={16} className="mr-2 text-blue-500" />
                              <span>{doc.fileName}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePreviewFile(doc.fileUrl)}
                              >
                                <Eye size={14} className="mr-1" /> Preview
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-primary hover:bg-primary/90"
                                onClick={() => handleDownloadFile(doc.fileUrl, doc.fileName)}
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
              </TabsContent>
              
              <TabsContent value="feedback">
                <CardContent className="space-y-6">
                  {selectedProposal.feedback && selectedProposal.feedback.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-medium">Feedback yang telah diberikan</h3>
                      
                      {selectedProposal.feedback.map((item, index) => (
                        <div 
                          key={item.id}
                          className="bg-gray-50 p-4 rounded-lg border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              {item.supervisor_name || 'Dosen Pembimbing'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(item.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <MessageSquare className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-gray-500">Belum ada feedback yang diberikan</p>
                    </div>
                  )}
                </CardContent>
              </TabsContent>
            </Tabs>

            <CardFooter className="flex justify-end">
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => setIsFeedbackDialogOpen(true)}
              >
                <MessageSquare size={16} className="mr-1" /> Berikan Feedback
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="md:col-span-2">
            <CardContent className="text-center py-10">
              <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Belum ada proposal yang dipilih</h3>
              <p className="text-gray-500">
                Pilih proposal dari daftar untuk melihat detailnya
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Feedback Dialog */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Berikan Feedback</DialogTitle>
            <DialogDescription>
              Berikan feedback untuk proposal "{selectedProposal?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea 
              placeholder="Masukkan feedback Anda di sini..." 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
            />
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsFeedbackDialogOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handleSendFeedback}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : (
                <>
                  <Send size={16} className="mr-1" /> Kirim Feedback
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupervisorFeedback;
