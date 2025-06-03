
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GuideDocument } from "@/types";
import { formatDate } from "@/services/mockData";
import { Download, Eye, FileText } from "lucide-react";
import { toast } from "sonner";

interface GuideCardProps {
  document: GuideDocument;
  onPreview: (fileUrl: string, title: string) => void;
}

const GuideCard = ({ document, onPreview }: GuideCardProps) => {
  const handleDownload = (fileUrl: string, title: string) => {
    // Open in a new tab
    window.open(fileUrl, '_blank');
    toast.success(`Downloading ${title}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2" size={20} />
          {document.title}
        </CardTitle>
        <CardDescription>
          Upload: {formatDate(document.uploadDate)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          {document.description || 'Dokumen panduan kerja praktik'}
        </p>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onPreview(document.fileUrl, document.title)}
          >
            <Eye size={16} className="mr-2" /> Preview
          </Button>
          <Button 
            onClick={() => handleDownload(document.fileUrl, document.title)}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Download size={16} className="mr-2" /> Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuideCard;
