
import { FileText } from 'lucide-react';
import DocumentListItem from './DocumentListItem';
import { GuideDocument } from '@/types';

interface DocumentsListProps {
  documents: GuideDocument[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onPreview: (fileUrl: string) => void;
}

const DocumentsList = ({ documents, isLoading, onDelete, onPreview }: DocumentsListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-10">
        <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        <h3 className="text-lg font-medium text-gray-900">Tidak ada dokumen</h3>
        <p className="text-gray-500">
          Belum ada dokumen panduan yang diupload
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <DocumentListItem
          key={doc.id}
          document={doc}
          onDelete={onDelete}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
};

export default DocumentsList;
