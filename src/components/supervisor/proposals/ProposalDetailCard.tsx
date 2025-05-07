
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Eye, MessageSquare } from "lucide-react";
import { Proposal } from '@/hooks/useProposals';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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

interface ProposalDetailCardProps {
  proposal: Proposal | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  formatDate: (dateString: string) => string;
  handlePreviewFile: (url: string) => void;
  handleDownloadFile: (url: string, fileName: string) => void;
  onFeedbackClick: () => void;
}

const ProposalDetailCard = ({
  proposal,
  activeTab,
  setActiveTab,
  formatDate,
  handlePreviewFile,
  handleDownloadFile,
  onFeedbackClick
}: ProposalDetailCardProps) => {
  if (!proposal) {
    return (
      <Card className="md:col-span-2">
        <CardContent className="text-center py-10">
          <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900">Belum ada proposal yang dipilih</h3>
          <p className="text-gray-500">
            Pilih proposal dari daftar untuk melihat detailnya
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{proposal.title}</CardTitle>
          <CardDescription>
            Diajukan: {formatDate(proposal.submissionDate)}
          </CardDescription>
        </div>
        <Badge className={statusColors[proposal.status as keyof typeof statusColors]}>
          {statusLabels[proposal.status as keyof typeof statusLabels] || proposal.status}
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
              <p className="text-gray-600">{proposal.description || 'Tidak ada deskripsi'}</p>
            </div>
            
            {proposal.rejectionReason && proposal.status === 'rejected' && (
              <div className="bg-red-50 border border-red-100 rounded-md p-4">
                <h3 className="font-medium text-red-800 mb-1">Alasan Penolakan</h3>
                <p className="text-red-700">{proposal.rejectionReason}</p>
              </div>
            )}
            
            {proposal.teamId && (
              <div>
                <h3 className="font-medium mb-2">Tim KP</h3>
                <p className="text-gray-600">{proposal.teamName || 'Tim KP'}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-medium mb-2">Pembimbing</h3>
              {proposal.supervisors && proposal.supervisors.length > 0 ? (
                <div className="space-y-2">
                  {proposal.supervisors.map((supervisor, index) => (
                    <div key={supervisor.id} className="flex items-center p-2 bg-gray-50 rounded">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={supervisor.profile_image || "/placeholder.svg"} alt={supervisor.full_name} />
                        <AvatarFallback>{supervisor.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
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
              {proposal.documents && proposal.documents.length > 0 ? (
                <div className="space-y-3">
                  {proposal.documents.map((doc) => (
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
            {proposal.feedback && proposal.feedback.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-medium">Feedback yang telah diberikan</h3>
                
                {proposal.feedback.map((item) => (
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
          onClick={onFeedbackClick}
        >
          <MessageSquare size={16} className="mr-1" /> Berikan Feedback
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProposalDetailCard;
