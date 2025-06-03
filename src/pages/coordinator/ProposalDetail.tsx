
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Download, File, User, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { proposals, supervisors, formatDate, teams, students } from '@/services/mockData';

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

const ProposalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Find proposal by ID
  const proposal = proposals.find(p => p.id === id);
  
  // Find team associated with this proposal
  const team = proposal ? teams.find(t => t.id === proposal.teamId) : undefined;
  
  // Find supervisors for this proposal
  const proposalSupervisors = proposal?.supervisorIds.map(id => 
    supervisors.find(s => s.id === id)
  ).filter(Boolean) || [];

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

  const handleApprove = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsApproveDialogOpen(false);
      toast.success('Proposal berhasil disetujui');
      navigate('/coordinator/proposal-review');
    }, 1000);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Harap berikan alasan penolakan');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsRejectDialogOpen(false);
      toast.success('Proposal berhasil ditolak');
      navigate('/coordinator/proposal-review');
    }, 1000);
  };

  const handleDownloadFile = (fileName: string) => {
    toast.success(`Downloading ${fileName}`);
  };

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
        
        <Badge className={statusColors[proposal.status]}>
          {statusLabels[proposal.status]}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Proposal Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{proposal.title}</CardTitle>
            <CardDescription>
              Submitted: {formatDate(proposal.submissionDate)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Deskripsi</h3>
              <p className="text-gray-600">{proposal.description}</p>
            </div>
            
            {proposal.status === 'rejected' && proposal.rejectionReason && (
              <div className="bg-red-50 border border-red-100 rounded-md p-4">
                <h3 className="font-medium text-red-800 mb-1">Alasan Penolakan</h3>
                <p className="text-red-700">{proposal.rejectionReason}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-medium mb-2">Attachment</h3>
              {proposal.attachments.length > 0 ? (
                <div className="space-y-3">
                  {proposal.attachments.map(attachment => (
                    <div 
                      key={attachment.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-center">
                        <File size={16} className="mr-2 text-blue-500" />
                        <span>{attachment.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mr-2"
                        >
                          Buka
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
            {team && (
              <>
                <div>
                  <h3 className="font-medium mb-2">Nama Tim</h3>
                  <p className="text-gray-600">{team.name}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Anggota Tim</h3>
                  <div className="space-y-2">
                    {team.members.map(member => (
                      <div 
                        key={member.id}
                        className="flex items-center p-2 bg-gray-50 rounded"
                      >
                        <User size={16} className="mr-2" />
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.nim}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            <div>
              <h3 className="font-medium mb-2">Dosen Pembimbing</h3>
              <div className="space-y-2">
                {proposalSupervisors.map(supervisor => supervisor && (
                  <div 
                    key={supervisor.id}
                    className="flex items-center p-2 bg-gray-50 rounded"
                  >
                    <User size={16} className="mr-2" />
                    <div>
                      <div className="font-medium">{supervisor.name}</div>
                      <div className="text-xs text-gray-500">{supervisor.nip}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
    </div>
  );
};

export default ProposalDetail;
