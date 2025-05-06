
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewUrl: string | null;
  previewName: string;
}

const DocumentPreviewDialog = ({
  open,
  onOpenChange,
  previewUrl,
  previewName,
}: DocumentPreviewDialogProps) => {
  const handleDownload = (url: string, filename: string) => {
    window.open(url, '_blank');
    toast.success(`Downloading ${filename}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Preview: {previewName}</DialogTitle>
          <DialogDescription>Preview dokumen</DialogDescription>
        </DialogHeader>
        <div className="mt-4 h-[60vh] border rounded overflow-hidden">
          <iframe
            src={previewUrl || ''}
            title={previewName}
            className="w-full h-full"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button
            onClick={() =>
              previewUrl && handleDownload(previewUrl, previewName)
            }
          >
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewDialog;
