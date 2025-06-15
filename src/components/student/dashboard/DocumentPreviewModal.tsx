
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string | null;
  documentName: string | null;
}

export const DocumentPreviewModal = ({ 
  isOpen, 
  onClose, 
  documentUrl, 
  documentName 
}: DocumentPreviewModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{documentName || "Pratinjau Dokumen"}</DialogTitle>
        </DialogHeader>
        {documentUrl ? (
          <iframe
            src={documentUrl}
            title={documentName || "Dokumen"}
            width="100%"
            height="500"
            className="border rounded-lg"
          />
        ) : (
          <div className="text-gray-500 text-center py-8">Dokumen tidak tersedia.</div>
        )}
      </DialogContent>
    </Dialog>
  );
};
