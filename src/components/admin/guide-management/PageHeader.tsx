
import { Button } from "@/components/ui/button";
import { UploadCloud } from 'lucide-react';
import { DialogTrigger } from "@/components/ui/dialog";

interface PageHeaderProps {
  onUploadClick?: () => void;
}

const PageHeader = ({ onUploadClick }: PageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold">Panduan KP</h1>
        <p className="text-gray-600">
          Upload dan kelola dokumen panduan kerja praktik untuk mahasiswa
        </p>
      </div>

      <DialogTrigger asChild onClick={onUploadClick}>
        <Button className="bg-primary hover:bg-primary/90">
          <UploadCloud size={16} className="mr-1" /> Upload Panduan
        </Button>
      </DialogTrigger>
    </div>
  );
};

export default PageHeader;
