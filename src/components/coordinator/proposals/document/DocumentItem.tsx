
import { File, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentItemProps {
  document: {
    id: string;
    file_name: string;
    file_url: string;
    file_type?: string;
  };
  onPreviewDocument: (url: string, name: string) => void;
  onDownloadFile: (url: string, fileName: string) => void;
}

const DocumentItem = ({ 
  document, 
  onPreviewDocument, 
  onDownloadFile 
}: DocumentItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <div className="flex items-center">
        <File size={16} className="mr-2 text-blue-500" />
        <span>{document.file_name}</span>
      </div>
      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="sm"
          className="mr-2"
          onClick={() => onPreviewDocument(document.file_url, document.file_name)}
        >
          <Eye size={14} className="mr-1" /> Preview
        </Button>
        <Button 
          size="sm" 
          className="bg-primary hover:bg-primary/90"
          onClick={() => onDownloadFile(document.file_url, document.file_name)}
        >
          <Download size={14} className="mr-1" /> Download
        </Button>
      </div>
    </div>
  );
};

export default DocumentItem;
