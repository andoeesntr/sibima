
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

// Define proper interfaces
interface Student {
  id: string;
  full_name: string;
  nim?: string;
}

interface Attachment {
  id: string;
  name: string;
  fileUrl: string;
}

interface Proposal {
  id: string;
  title: string;
  status: string;
  submissionDate: string;
  description?: string;
  student: Student;
  teamId?: string;
  teamName?: string;
  teamMembers?: Student[];
  feedback?: string[];
  attachments: Attachment[];
}

const SupervisorFeedback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get('id');
  const { user } = useAuth();
  
  const [supervisedProposals, setSupervisedProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('detail');
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch proposals on component mount
  useEffect(() => {
    if (user?.id) {
      fetchSupervisorProposals();
    }
  }, [user]);

  // Fetch proposals supervised by this supervisor
  const fetchSupervisorProposals = async () => {
    setIsLoading(true);
    try {
      if (!user?.id) {
        return;
      }

      // Get proposals supervised by this supervisor with explicit column specification
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('proposals')
        .select(`
          id,
          title,
          status,
          description,
          created_at,
          team_id,
          student:profiles!student_id (id, full_name, nim)
        `)
        .eq('supervisor_id', user.id);

      if (proposalsError) {
        throw proposalsError;
      }

      console.log('Fetched proposals:', proposalsData);

      // Transform the data to match our Proposal interface
      const formattedProposals: Proposal[] = proposalsData.map(proposal => ({
        id: proposal.id,
        title: proposal.title,
        status: proposal.status || 'submitted',
        submissionDate: proposal.created_at,
        description: proposal.description,
        student: {
          id: proposal.student.id,
          full_name: proposal.student.full_name,
          nim: proposal.student.nim
        },
        teamId: proposal.team_id,
        attachments: [], // Will be populated later if needed
        feedback: [] // Will be populated later if needed
      }));

      setSupervisedProposals(formattedProposals);

      // If a proposal ID is provided in the URL, select that one
      if (proposalId) {
        const selected = formattedProposals.find(p => p.id === proposalId);
        if (selected) {
          setSelectedProposal(selected);
        }
      } else if (formattedProposals.length > 0) {
        // Otherwise, select the first one
        setSelectedProposal(formattedProposals[0]);
      }
    } catch (error) {
      console.error('Error fetching supervisor proposals:', error);
      toast.error('Failed to load proposals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
  };

  const handleSendFeedback = async () => {
    if (!feedback.trim()) {
      toast.error('Harap masukkan feedback');
      return;
    }

    if (!selectedProposal?.id) {
      toast.error('No proposal selected');
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real application, you would update the proposal feedback in the database
      // For now, just simulate the API call with a timeout
      setTimeout(() => {
        // Update the local state with the new feedback
        const updatedProposals = supervisedProposals.map(p => {
          if (p.id === selectedProposal.id) {
            return {
              ...p,
              feedback: [...(p.feedback || []), feedback]
            };
          }
          return p;
        });

        setSupervisedProposals(updatedProposals);
        
        // Also update the selected proposal
        if (selectedProposal) {
          setSelectedProposal({
            ...selectedProposal,
            feedback: [...(selectedProposal.feedback || []), feedback]
          });
        }

        setIsSubmitting(false);
        setIsFeedbackDialogOpen(false);
        setFeedback('');
        toast.success('Feedback berhasil dikirim');
      }, 1000);
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast.error('Failed to send feedback');
      setIsSubmitting(false);
    }
  };

  const handleDownloadFile = (fileName: string) => {
    toast.success(`Downloading ${fileName}`);
  };

  const handlePreviewFile = (fileUrl: string) => {
    toast.info(`Preview not available for ${fileUrl}`);
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
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {supervisedProposals.length > 0 ? (
                  supervisedProposals.map(proposal => (
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
                        Student: {proposal.student?.full_name || 'Unknown'}
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
                  
                  {selectedProposal.teamId && (
                    <div>
                      <h3 className="font-medium mb-2">Tim KP</h3>
                      <div className="space-y-2">
                        <p className="text-gray-600">{selectedProposal.teamName || 'Tim KP'}</p>
                        
                        <h4 className="text-sm text-gray-500">Anggota Tim:</h4>
                        <div className="space-y-1">
                          {selectedProposal.teamMembers && selectedProposal.teamMembers.length > 0 ? (
                            selectedProposal.teamMembers.map(member => (
                              <div 
                                key={member.id}
                                className="text-sm bg-gray-50 p-2 rounded"
                              >
                                {member.full_name} ({member.nim || 'No NIM'})
                              </div>
                            ))
                          ) : (
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              {selectedProposal.student?.full_name || 'Unknown'} ({selectedProposal.student?.nim || 'No NIM'})
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium mb-2">Attachment</h3>
                    {selectedProposal.attachments && selectedProposal.attachments.length > 0 ? (
                      <div className="space-y-3">
                        {selectedProposal.attachments.map((attachment, index) => (
                          <div 
                            key={attachment.id || index}
                            className="flex items-center justify-between p-3 border rounded-md"
                          >
                            <div className="flex items-center">
                              <FileText size={16} className="mr-2 text-blue-500" />
                              <span>{attachment.name}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePreviewFile(attachment.fileUrl)}
                              >
                                <Eye size={14} className="mr-1" /> Buka
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-primary hover:bg-primary/90"
                                onClick={() => handleDownloadFile(attachment.name)}
                              >
                                <Download size={14} className="mr-1" /> Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Tidak ada attachment</p>
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
                          key={index}
                          className="bg-gray-50 p-4 rounded-lg border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Feedback #{index + 1}</span>
                            <span className="text-xs text-gray-500">
                              {formatDate(new Date().toISOString())}
                            </span>
                          </div>
                          <p className="text-gray-700">{item}</p>
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
