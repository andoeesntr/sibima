
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { uploadGuideDocument } from '@/services/guideService';
import { GuideDocument } from '@/types';

interface UploadDocumentFormProps {
  onClose: () => void;
  onSuccess: (doc: GuideDocument) => void;
}

const UploadDocumentForm = ({ onClose, onSuccess }: UploadDocumentFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !file) {
      toast.error('Harap isi judul dan pilih file untuk diupload');
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadGuideDocument(
        title,
        description || null,
        file
      );
      
      if (result) {
        onSuccess(result);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="title">Judul Dokumen</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masukkan judul dokumen"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Masukkan deskripsi dokumen (opsional)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
          <UploadCloud size={32} className="text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 text-center mb-3">
            Drag & drop file atau klik tombol di bawah
          </p>
          <Input
            id="file"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="max-w-xs"
          />
          {file && (
            <div className="mt-3 text-sm text-gray-600">
              File dipilih: <span className="font-medium">{file.name}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Format yang didukung: PDF, DOC, DOCX (max 10MB)
        </p>
      </div>

      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onClose} disabled={isUploading}>
          Batal
        </Button>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={handleSubmit}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <UploadCloud size={16} className="animate-bounce mr-1" />
              Mengupload...
            </>
          ) : (
            'Upload Dokumen'
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default UploadDocumentForm;
