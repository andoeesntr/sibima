
import { FileText, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
}

interface DocumentListProps {
  documents: Document[];
  handlePreviewFile: (url: string) => void;
  handleDownloadFile: (url: string, fileName: string) => void;
}

const DocumentList = ({ documents, handlePreviewFile, handleDownloadFile }: DocumentListProps) => {
  if (!documents || documents.length === 0) {
    return <p className="text-gray-500">Tidak ada dokumen</p>;
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div 
          key={doc.id}
          className="flex items-center justify-between p-3 border rounded-md"
        >
          <div className="flex items-center">
            <FileText size={16} className="mr-2 text-blue-500" />
            <span>{doc.fileName}</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePreviewFile(doc.fileUrl)}
            >
              <Eye size={14} className="mr-1" /> Preview
            </Button>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => handleDownloadFile(doc.fileUrl, doc.fileName)}
            >
              <Download size={14} className="mr-1" /> Download
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
