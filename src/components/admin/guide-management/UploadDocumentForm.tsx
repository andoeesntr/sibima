
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UploadCloud, AlertCircle } from 'lucide-react';
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
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setUploadMessage(null);
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setFileError('File terlalu besar. Ukuran maksimum adalah 10MB.');
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setFileError('Format file tidak didukung. Gunakan PDF atau DOC/DOCX.');
        return;
      }
      
      setFile(selectedFile);
      setUploadMessage(`File ${selectedFile.name} siap untuk diupload`);
    }
  };

  const handleSubmit = async () => {
    if (!title) {
      toast.error('Harap isi judul dokumen');
      return;
    }
    
    if (!file) {
      toast.error('Harap pilih file untuk diupload');
      return;
    }

    setIsUploading(true);
    setUploadMessage('Mengupload dokumen, mohon tunggu...');

    try {
      const result = await uploadGuideDocument(
        title,
        description || null,
        file
      );
      
      if (result) {
        setUploadMessage('Upload berhasil!');
        onSuccess(result);
      } else {
        setUploadMessage(null);
        setFileError('Gagal mengupload dokumen. Silahkan coba lagi.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadMessage(null);
      setFileError('Terjadi kesalahan saat mengupload dokumen. Silahkan coba lagi.');
      toast.error('Gagal mengupload dokumen. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <DialogHeader>
        <DialogTitle>Upload Dokumen Panduan</DialogTitle>
        <DialogDescription>
          Upload dokumen panduan untuk mahasiswa dan dosen
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-2">
        <Label htmlFor="title">Judul Dokumen</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masukkan judul dokumen"
          disabled={isUploading}
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
          disabled={isUploading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <div className={`border ${fileError ? 'border-red-300 bg-red-50' : 'border-dashed'} rounded-lg p-6 flex flex-col items-center justify-center`}>
          <UploadCloud size={32} className={`${fileError ? 'text-red-400' : 'text-gray-400'} mb-2`} />
          <p className="text-sm text-gray-600 text-center mb-3">
            {isUploading ? 'Mengupload file...' : 'Drag & drop file atau klik tombol di bawah'}
          </p>
          <Input
            id="file"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="max-w-xs"
            disabled={isUploading}
          />
          {fileError && (
            <div className="mt-3 text-sm text-red-500 flex items-center">
              <AlertCircle size={16} className="mr-1" />
              {fileError}
            </div>
          )}
          {uploadMessage && !fileError && (
            <div className="mt-3 text-sm text-green-600">
              {uploadMessage}
            </div>
          )}
          {file && !fileError && !uploadMessage && (
            <div className="mt-3 text-sm text-gray-600">
              File dipilih: <span className="font-medium">{file.name}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Format yang didukung: PDF, DOC, DOCX (maks 10MB)
        </p>
      </div>

      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onClose} disabled={isUploading}>
          Batal
        </Button>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={handleSubmit}
          disabled={isUploading || !!fileError}
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
