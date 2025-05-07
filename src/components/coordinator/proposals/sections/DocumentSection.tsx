
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
}

const DocumentSection = ({
  documents,
  onPreviewDocument,
  onDownloadFile
}: DocumentSectionProps) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Dokumen</h3>
      <DocumentList 
        documents={documents}
        onPreviewDocument={onPreviewDocument}
        onDownloadFile={onDownloadFile}
      />
    </div>
  );
};

export default DocumentSection;
