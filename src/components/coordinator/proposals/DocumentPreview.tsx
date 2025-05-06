
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DocumentPreviewProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  url: string;
  name: string;
  onDownload: (url: string, name: string) => void;
}

const DocumentPreview = ({
  isOpen,
  setIsOpen,
  url,
  name,
  onDownload
}: DocumentPreviewProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Preview: {name}</DialogTitle>
          <DialogDescription>
            Preview dokumen
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 h-[60vh] border rounded overflow-hidden">
          <iframe 
            src={url} 
            title={name}
            className="w-full h-full"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button
            onClick={() => onDownload(url, name)}
          >
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreview;
