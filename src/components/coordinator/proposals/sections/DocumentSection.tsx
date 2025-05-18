
import DocumentList from "../document/DocumentList";

interface DocumentSectionProps {
  documents: Array<{
    id: string;
    file_name: string;
    file_url: string;
    file_type?: string;
  }>;
  onPreviewDocument: (url: string, name: string) => void;
  onDownloadFile: (url: string, fileName: string) => void;
  showOnlyLatest?: boolean;
}

const DocumentSection = ({
  documents,
  onPreviewDocument,
  onDownloadFile,
  showOnlyLatest = true
}: DocumentSectionProps) => {
  // If showOnlyLatest is true, only show the most recent document
  const displayDocuments = showOnlyLatest && documents.length > 0 
    ? [documents[0]] 
    : documents;
  
  return (
    <div>
      <h3 className="font-medium mb-2">Dokumen</h3>
      <DocumentList 
        documents={displayDocuments}
        onPreviewDocument={onPreviewDocument}
        onDownloadFile={onDownloadFile}
      />
    </div>
  );
};

export default DocumentSection;
