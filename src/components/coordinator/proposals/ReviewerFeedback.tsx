
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/utils/proposalConstants';

interface ReviewerFeedbackProps {
  proposalId: string;
}

interface FeedbackItem {
  id: string;
  content: string;
  created_at: string;
  supervisor_name: string;
  supervisor_email: string;
}

const ReviewerFeedback = ({ proposalId }: ReviewerFeedbackProps) => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewerFeedback();
    
    // Set up real-time subscription for new feedback
    const channel = supabase
      .channel(`proposal-feedback-${proposalId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proposal_feedback',
          filter: `proposal_id=eq.${proposalId}`
        },
        () => {
          console.log('Feedback updated, reloading...');
          fetchReviewerFeedback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [proposalId]);

  const fetchReviewerFeedback = async () => {
    try {
      setLoading(true);
      
      // Get feedback for this proposal
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('proposal_feedback')
        .select('id, content, created_at, supervisor_id')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: false });

      if (feedbackError) {
        console.error('Error fetching feedback:', feedbackError);
        setFeedback([]);
        return;
      }

      if (!feedbackData || feedbackData.length === 0) {
        setFeedback([]);
        return;
      }

      // Get unique supervisor IDs
      const supervisorIds = [...new Set(feedbackData.map(item => item.supervisor_id))];

      // Fetch supervisor profiles
      const { data: supervisorData, error: supervisorError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', supervisorIds);

      if (supervisorError) {
        console.error('Error fetching supervisors:', supervisorError);
      }

      // Combine feedback with supervisor information
      const formattedFeedback: FeedbackItem[] = feedbackData.map(item => {
        const supervisor = supervisorData?.find(s => s.id === item.supervisor_id);
        return {
          id: item.id,
          content: item.content,
          created_at: item.created_at,
          supervisor_name: supervisor?.full_name || 'Unknown Reviewer',
          supervisor_email: supervisor?.email || ''
        };
      });

      console.log('Formatted feedback:', formattedFeedback);
      setFeedback(formattedFeedback);
    } catch (error) {
      console.error('Error fetching reviewer feedback:', error);
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback Dosen Reviewer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Feedback Dosen Reviewer
        </CardTitle>
        <CardDescription>
          Catatan dan masukan dari dosen reviewer untuk proposal ini
        </CardDescription>
      </CardHeader>
      <CardContent>
        {feedback.length === 0 ? (
          <div className="text-center py-6">
            <MessageSquare className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p className="text-gray-500">Belum ada feedback dari dosen reviewer</p>
            <p className="text-xs text-gray-400 mt-1">
              Feedback akan muncul otomatis setelah dosen memberikan ulasan
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div 
                key={item.id}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {item.supervisor_name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Reviewer
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(item.created_at)}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </p>
                {item.supervisor_email && (
                  <p className="text-xs text-gray-500 mt-2">
                    {item.supervisor_email}
                  </p>
                )}
              </div>
            ))}
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Total feedback: <span className="font-medium">{feedback.length}</span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewerFeedback;
