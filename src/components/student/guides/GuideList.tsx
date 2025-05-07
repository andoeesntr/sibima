
import { GuideDocument } from "@/types";
import GuideCard from "./GuideCard";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";

interface GuideListProps {
  documents: GuideDocument[];
  isLoading: boolean;
  onPreview: (fileUrl: string, title: string) => void;
}

const GuideList = ({ documents, isLoading, onPreview }: GuideListProps) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (documents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {documents.map((doc) => (
        <GuideCard 
          key={doc.id}
          document={doc}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
};

export default GuideList;
