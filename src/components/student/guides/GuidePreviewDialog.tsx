
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

interface GuidePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewUrl: string | null;
  previewName: string;
}

const GuidePreviewDialog = ({
  open,
  onOpenChange,
  previewUrl,
  previewName,
}: GuidePreviewDialogProps) => {
  const handleDownload = (url: string, filename: string) => {
    window.open(url, '_blank');
    toast.success(`Downloading ${filename}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Preview: {previewName}</DialogTitle>
          <DialogDescription>
            Pratinjau dokumen panduan
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 h-full border rounded-lg overflow-hidden">
          <iframe 
            src={previewUrl || ''} 
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
              onClick={() => previewUrl && handleDownload(previewUrl, previewName)}
              className="bg-primary hover:bg-primary/90"
            >
              <Download size={16} className="mr-2" /> Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuidePreviewDialog;
