
import DocumentItem from "./DocumentItem";

interface DocumentListProps {
  documents: Array<{
    id: string;
    file_name: string;
    file_url: string;
    file_type?: string;
  }>;
  onPreviewDocument: (url: string, name: string) => void;
  onDownloadFile: (url: string, fileName: string) => void;
}

const DocumentList = ({
  documents,
  onPreviewDocument,
  onDownloadFile
}: DocumentListProps) => {
  if (documents.length === 0) {
    return <p className="text-gray-500">Tidak ada dokumen</p>;
  }
  
  return (
    <div className="space-y-3">
      {documents.map(doc => (
        <DocumentItem 
          key={doc.id}
          document={doc}
          onPreviewDocument={onPreviewDocument}
          onDownloadFile={onDownloadFile}
        />
      ))}
    </div>
  );
};

export default DocumentList;
