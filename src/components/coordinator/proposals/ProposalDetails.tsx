
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { File, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/services/mockData";

interface ProposalDetailsProps {
  title: string;
  createdAt: string;
  description: string;
  companyName?: string | null;
  rejectionReason?: string | null;
  status: string;
  documents: Array<{
    id: string;
    file_name: string;
    file_url: string;
    file_type?: string;
  }>;
  onPreviewDocument: (url: string, name: string) => void;
  onDownloadFile: (url: string, fileName: string) => void;
}

const ProposalDetails = ({
  title,
  createdAt,
  description,
  companyName,
  rejectionReason,
  status,
  documents,
  onPreviewDocument,
  onDownloadFile
}: ProposalDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Submitted: {formatDate(createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Deskripsi</h3>
          <p className="text-gray-600">{description}</p>
        </div>
        
        {companyName && (
          <div>
            <h3 className="font-medium mb-2">Perusahaan/Instansi</h3>
            <p className="text-gray-600">{companyName}</p>
          </div>
        )}
        
        {status === 'rejected' && rejectionReason && (
          <div className="bg-red-50 border border-red-100 rounded-md p-4">
            <h3 className="font-medium text-red-800 mb-1">Alasan Penolakan</h3>
            <p className="text-red-700">{rejectionReason}</p>
          </div>
        )}
        
        <div>
          <h3 className="font-medium mb-2">Dokumen</h3>
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map(doc => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center">
                    <File size={16} className="mr-2 text-blue-500" />
                    <span>{doc.file_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mr-2"
                      onClick={() => onPreviewDocument(doc.file_url, doc.file_name)}
                    >
                      <Eye size={14} className="mr-1" /> Preview
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => onDownloadFile(doc.file_url, doc.file_name)}
                    >
                      <Download size={14} className="mr-1" /> Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Tidak ada dokumen</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalDetails;
