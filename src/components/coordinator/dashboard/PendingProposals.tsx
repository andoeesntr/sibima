
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProposals } from '@/hooks/useProposals';

const PendingProposals = () => {
  const navigate = useNavigate();
  const { proposals, loading } = useProposals();

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };

  // Filter for pending proposals only
  const pendingProposals = proposals.filter(proposal => proposal.status === 'submitted');

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Proposal Menunggu Review</CardTitle>
          <CardDescription>Proposal yang perlu ditinjau</CardDescription>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/coordinator/proposal-review')}
        >
          Lihat Semua
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : pendingProposals.length > 0 ? (
          pendingProposals.slice(0, 3).map(proposal => (
            <div 
              key={proposal.id}
              className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-medium">{proposal.title}</span>
                <span className="text-sm text-gray-500">
                  Submitted: {formatDate(proposal.submissionDate)}
                </span>
                {proposal.studentName && (
                  <span className="text-sm text-gray-500">
                    By: {proposal.studentName}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500">Menunggu Review</Badge>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate(`/coordinator/proposal-detail/${proposal.id}`)}
                >
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Tidak ada proposal yang menunggu review</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          variant="default"
          onClick={() => navigate('/coordinator/proposal-review')}
        >
          Review Proposal
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PendingProposals;

