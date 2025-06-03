
import { MessageSquare } from "lucide-react";
import { FeedbackEntry } from "@/types/supervisorProposals";
import { useEffect, useState } from "react";
import { fetchProposalFeedback } from "@/services/supervisor/feedbackService";

interface FeedbackListProps {
  feedback: FeedbackEntry[];
  formatDate: (dateString: string) => string;
  proposalId?: string; // Add proposalId to fetch fresh feedback
}

const FeedbackList = ({ feedback, formatDate, proposalId }: FeedbackListProps) => {
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackEntry[]>(feedback);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch fresh feedback when proposalId changes or component mounts
  useEffect(() => {
    const loadFeedback = async () => {
      if (!proposalId) return;
      
      setIsLoading(true);
      try {
        const freshFeedback = await fetchProposalFeedback(proposalId);
        console.log('Fresh feedback loaded:', freshFeedback);
        setCurrentFeedback(freshFeedback);
      } catch (error) {
        console.error('Error loading feedback:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedback();
  }, [proposalId]);

  // Update currentFeedback when feedback prop changes
  useEffect(() => {
    setCurrentFeedback(feedback);
  }, [feedback]);

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-gray-500">Memuat feedback...</p>
      </div>
    );
  }

  if (!currentFeedback || currentFeedback.length === 0) {
    return (
      <div className="text-center py-6">
        <MessageSquare className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        <p className="text-gray-500">Belum ada feedback yang diberikan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Feedback yang telah diberikan ({currentFeedback.length})</h3>
      
      {currentFeedback.map((item) => (
        <div 
          key={item.id}
          className="bg-gray-50 p-4 rounded-lg border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {item.supervisorName || 'Dosen Pembimbing'}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(item.createdAt)}
            </span>
          </div>
          <p className="text-gray-700">{item.content}</p>
        </div>
      ))}
    </div>
  );
};

export default FeedbackList;
