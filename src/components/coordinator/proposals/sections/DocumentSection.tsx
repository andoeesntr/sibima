
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
  // Sort documents by upload date - newest first
  const sortedDocuments = [...documents].sort((a, b) => {
    // If we don't have explicit upload dates, we can use the file names
    // as they often contain timestamps when using the proposalSubmissionService
    return b.file_name.localeCompare(a.file_name);
  });
  
  // If showOnlyLatest is true, only show the most recent document
  const displayDocuments = showOnlyLatest && sortedDocuments.length > 0 
    ? [sortedDocuments[0]] 
    : sortedDocuments;
  
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
