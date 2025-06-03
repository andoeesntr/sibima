
import { useState, useEffect } from "react";
import { fetchGuideDocuments } from "@/services/guideService";
import { GuideDocument } from "@/types";
import GuideList from "@/components/student/guides/GuideList";
import GuidePreviewDialog from "@/components/student/guides/GuidePreviewDialog";

const StudentGuide = () => {
  const [documents, setDocuments] = useState<GuideDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
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

      <GuideList 
        documents={documents}
        isLoading={isLoading}
        onPreview={handlePreview}
      />

      <GuidePreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        previewUrl={selectedDoc}
        previewName={previewName}
      />
    </div>
  );
};

export default StudentGuide;
