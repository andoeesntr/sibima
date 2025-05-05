
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Check, FileText, Search, User, X, FileIcon } from 'lucide-react';
import { formatDate } from '@/services/mockData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ProposalStatus = 'submitted' | 'approved' | 'rejected' | 'all';

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: string;
  submissionDate: string;
  reviewDate?: string;
  supervisorIds: string[];
  studentName?: string;
  documentUrl?: string;
}

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

const ProposalReview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProposalStatus>('submitted');
  const [searchQuery, setSearchQuery] = useState('');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch proposals from database
  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      
      // Fetch proposals with student information
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          id, 
          title,
          description,
          status, 
          created_at,
          supervisor_id,
          document_url,
          student:profiles!student_id (full_name)
        `);
      
      if (error) {
        throw error;
      }

      console.log("Raw proposal data:", data);

      // Transform data for our component
      const formattedProposals: Proposal[] = data.map(proposal => ({
        id: proposal.id,
        title: proposal.title,
        description: proposal.description || '',
        status: proposal.status || 'submitted',
        submissionDate: proposal.created_at,
        studentName: proposal.student?.full_name || 'Unknown Student',
        supervisorIds: proposal.supervisor_id ? [proposal.supervisor_id] : [],
        documentUrl: proposal.document_url,
      }));
      
      setProposals(formattedProposals);
      console.log("Fetched proposals:", formattedProposals);
    } catch (error: any) {
      console.error("Error fetching proposals:", error);
      toast.error("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    // Filter by tab selection
    if (activeTab !== 'all' && proposal.status !== activeTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      return proposal.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  });

  const handleViewProposal = (proposalId: string) => {
    navigate(`/coordinator/proposal-detail/${proposalId}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Review Proposal KP</h1>
        <div className="relative w-64">
          <Input
            placeholder="Cari proposal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProposalStatus)}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="submitted">Menunggu Review</TabsTrigger>
          <TabsTrigger value="approved">Disetujui</TabsTrigger>
          <TabsTrigger value="rejected">Ditolak</TabsTrigger>
          <TabsTrigger value="all">Semua</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredProposals.length > 0 ? (
            filteredProposals.map((proposal) => (
              <ProposalCard 
                key={proposal.id}
                proposal={proposal}
                onView={handleViewProposal}
              />
            ))
          ) : (
            <div className="text-center py-10">
              <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Tidak ada proposal</h3>
              <p className="text-gray-500">
                {searchQuery ? 
                  'Tidak ada proposal yang sesuai dengan pencarian Anda' : 
                  'Belum ada proposal yang perlu ditinjau'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

type ProposalCardProps = {
  proposal: Proposal;
  onView: (proposalId: string) => void;
};

const ProposalCard = ({ proposal, onView }: ProposalCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{proposal.title}</CardTitle>
        <Badge className={statusColors[proposal.status as keyof typeof statusColors]}>
          {statusLabels[proposal.status as keyof typeof statusLabels] || proposal.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600 mb-4">
          {proposal.description.substring(0, 100)}
          {proposal.description.length > 100 ? '...' : ''}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <User size={14} className="mr-1" />
            <span>{proposal.supervisorIds.length} Pembimbing</span>
          </div>
          {proposal.studentName && (
            <div>
              Student: {proposal.studentName}
            </div>
          )}
          <div>
            Submitted: {formatDate(proposal.submissionDate)}
          </div>
          {proposal.reviewDate && (
            <div>
              Reviewed: {formatDate(proposal.reviewDate)}
            </div>
          )}
          {proposal.documentUrl && (
            <div className="flex items-center text-blue-600">
              <FileText size={14} className="mr-1" />
              <a 
                href={proposal.documentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Lihat Dokumen
              </a>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {proposal.status === 'submitted' && (
          <>
            <Button 
              onClick={() => onView(proposal.id)}
              className="bg-primary hover:bg-primary/90 flex-1 mr-2"
            >
              <Check size={16} className="mr-1" /> Setuju
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => onView(proposal.id)}
              className="flex-1"
            >
              <X size={16} className="mr-1" /> Tolak
            </Button>
          </>
        )}
        {(proposal.status === 'approved' || proposal.status === 'rejected') && (
          <Button 
            variant="outline" 
            onClick={() => onView(proposal.id)}
            className="w-full"
          >
            <ArrowRight size={16} className="mr-1" /> Lihat Detail
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProposalReview;
