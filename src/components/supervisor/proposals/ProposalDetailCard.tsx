
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MessageSquare } from "lucide-react";

import ProposalDetailHeader from './components/ProposalDetailHeader';
import DetailSection from './components/DetailSection';
import FeedbackList from './components/FeedbackList';
import { Document, FeedbackEntry } from "@/hooks/useSupervisorProposals";

// Define a more flexible Proposal type for the component
interface DetailProposal {
  id: string;
  title: string;
  description?: string;
  submissionDate: string;
  status: string;
  rejectionReason?: string;
  teamId?: string;
  teamName?: string;
  supervisors?: {
    id: string;
    full_name: string;
    profile_image?: string;
  }[];
  documents?: Document[];
  feedback?: FeedbackEntry[];
  [key: string]: any; // Allow for other properties
}

interface ProposalDetailCardProps {
  proposal: DetailProposal | null;
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
      <ProposalDetailHeader 
        title={proposal.title}
        submissionDate={proposal.submissionDate}
        status={proposal.status}
        formatDate={formatDate}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 px-6">
          <TabsTrigger value="detail">Detail</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="detail">
          <CardContent>
            <DetailSection 
              description={proposal.description || ''}
              rejectionReason={proposal.rejectionReason}
              status={proposal.status}
              teamId={proposal.teamId}
              teamName={proposal.teamName}
              supervisors={proposal.supervisors || []}
              documents={proposal.documents || []}
              handlePreviewFile={handlePreviewFile}
              handleDownloadFile={handleDownloadFile}
            />
          </CardContent>
        </TabsContent>
        
        <TabsContent value="feedback">
          <CardContent>
            <FeedbackList 
              feedback={proposal.feedback || []}
              formatDate={formatDate}
            />
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
