
import { Button } from "@/components/ui/button";
import { FileText, Eye, Download } from "lucide-react";
import { toast } from "sonner";

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

interface AttachmentListProps {
  attachments: Attachment[];
  onPreview: (url: string, name: string) => void;
}

const AttachmentList = ({ attachments, onPreview }: AttachmentListProps) => {
  const handleDownload = (url: string, filename: string) => {
    window.open(url, '_blank');
    toast.success(`Downloading ${filename}`);
  };

  if (attachments.length === 0) {
    return <p className="text-gray-500">Tidak ada lampiran tersedia</p>;
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div className="flex items-center">
            <FileText size={18} className="mr-2 text-primary" />
            <span>{attachment.file_name}</span>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onPreview(attachment.file_url, attachment.file_name)}
            >
              <Eye size={16} className="mr-1" /> Preview
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleDownload(attachment.file_url, attachment.file_name)}
            >
              <Download size={16} className="mr-1" /> Download
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttachmentList;
