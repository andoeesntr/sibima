
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { guideDocuments, formatDate } from '@/services/mockData';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

const StudentGuide = () => {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const handleDownload = (fileUrl: string, title: string) => {
    // In a real app, this would trigger a file download
    toast.success(`Downloading ${title}`);
  };

  const handlePreview = (fileUrl: string) => {
    setSelectedDoc(fileUrl);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panduan KP</h1>
      <p className="text-gray-600">
        Panduan dan template dokumen untuk pelaksanaan Kerja Praktik
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guideDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2" size={20} />
                {doc.title}
              </CardTitle>
              <CardDescription>
                Upload: {formatDate(doc.uploadDate)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {doc.description || 'Dokumen panduan kerja praktik'}
              </p>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handlePreview(doc.fileUrl)}
                >
                  <Eye size={16} className="mr-2" /> Preview
                </Button>
                <Button 
                  onClick={() => handleDownload(doc.fileUrl, doc.title)}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Download size={16} className="mr-2" /> Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-3xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Preview Dokumen</DialogTitle>
            <DialogDescription>
              Pratinjau dokumen panduan
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 h-full border rounded-lg overflow-hidden">
            <iframe 
              src={selectedDoc || ''} 
              width="100%" 
              height="100%" 
              className="border-0"
            >
              Browser Anda tidak mendukung iframe
            </iframe>
            <div className="text-center p-4">
              <p className="text-sm text-gray-500 mb-2">
                Jika dokumen tidak tampil, silakan download langsung
              </p>
              <Button 
                onClick={() => handleDownload(selectedDoc || '', 'Dokumen')}
                className="bg-primary hover:bg-primary/90"
              >
                <Download size={16} className="mr-2" /> Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentGuide;
