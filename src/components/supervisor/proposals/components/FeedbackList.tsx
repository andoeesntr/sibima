
import { MessageSquare } from "lucide-react";
import { FeedbackEntry } from "@/types/supervisorProposals";

interface FeedbackListProps {
  feedback: FeedbackEntry[];
  formatDate: (dateString: string) => string;
}

const FeedbackList = ({ feedback, formatDate }: FeedbackListProps) => {
  if (!feedback || feedback.length === 0) {
    return (
      <div className="text-center py-6">
        <MessageSquare className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        <p className="text-gray-500">Belum ada feedback yang diberikan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Feedback yang telah diberikan</h3>
      
      {feedback.map((item) => (
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
