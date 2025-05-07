
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/services/mockData';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchGuideDocuments } from "@/services/guideService";
import { GuideDocument } from "@/types";

const StudentGuide = () => {
  const [documents, setDocuments] = useState<GuideDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewName, setPreviewName] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    const docs = await fetchGuideDocuments();
    setDocuments(docs);
    setIsLoading(false);
  };

  const handleDownload = (fileUrl: string, title: string) => {
    // Open in a new tab
    window.open(fileUrl, '_blank');
    toast.success(`Downloading ${title}`);
  };

  const handlePreview = (fileUrl: string, title: string) => {
    setSelectedDoc(fileUrl);
    setPreviewName(title);
    setPreviewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panduan KP</h1>
      <p className="text-gray-600">
        Panduan dan template dokumen untuk pelaksanaan Kerja Praktik
      </p>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.length > 0 ? (
            documents.map((doc) => (
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
                      onClick={() => handlePreview(doc.fileUrl, doc.title)}
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
            ))
          ) : (
            <div className="col-span-2 text-center py-10 border rounded-lg">
              <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Tidak ada dokumen</h3>
              <p className="text-gray-500">
                Belum ada dokumen panduan yang tersedia
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={(open) => !open && setPreviewDialogOpen(false)}>
        <DialogContent className="max-w-3xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Preview: {previewName}</DialogTitle>
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
                onClick={() => selectedDoc && handleDownload(selectedDoc, previewName)}
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
