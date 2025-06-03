
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface PreviewDialogProps {
  previewUrl: string | null;
  onClose: () => void;
}

const PreviewDialog = ({ previewUrl, onClose }: PreviewDialogProps) => {
  return (
    <Dialog open={!!previewUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Preview Dokumen</DialogTitle>
          <DialogDescription>
            Pratinjau dokumen panduan
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 h-full border rounded-lg overflow-hidden">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              width="100%"
              height="100%"
              className="border-0"
            >
              Browser Anda tidak mendukung iframe
            </iframe>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Preview tidak tersedia</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;
