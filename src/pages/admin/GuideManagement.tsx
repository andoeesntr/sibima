
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { fetchGuideDocuments } from '@/services/guideService';
import { GuideDocument } from '@/types';

// Import the smaller components
import UploadDocumentForm from '@/components/admin/guide-management/UploadDocumentForm';
import DocumentsList from '@/components/admin/guide-management/DocumentsList';
import PreviewDialog from '@/components/admin/guide-management/PreviewDialog';
import PageHeader from '@/components/admin/guide-management/PageHeader';

const GuideManagement = () => {
  const [documents, setDocuments] = useState<GuideDocument[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    const docs = await fetchGuideDocuments();
    setDocuments(docs);
    setIsLoading(false);
  };

  const handlePreview = (fileUrl: string) => {
    setPreviewUrl(fileUrl);
  };

  const handleDelete = (docId: string) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  };

  return (
    <div className="space-y-6">
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <PageHeader onUploadClick={() => setIsUploadDialogOpen(true)} />
        
        <DialogContent>
          <UploadDocumentForm 
            onClose={() => setIsUploadDialogOpen(false)} 
            onSuccess={(newDoc) => {
              setDocuments([newDoc, ...documents]);
              setIsUploadDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Dokumen Panduan</CardTitle>
          <CardDescription>
            Dokumen panduan yang tersedia untuk mahasiswa dan dosen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentsList 
            documents={documents} 
            isLoading={isLoading} 
            onDelete={handleDelete}
            onPreview={handlePreview}
          />
        </CardContent>
      </Card>

      <PreviewDialog 
        previewUrl={previewUrl} 
        onClose={() => setPreviewUrl(null)} 
      />
    </div>
  );
};

export default GuideManagement;
