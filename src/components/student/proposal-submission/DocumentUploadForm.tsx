
import { AlertCircle, FileUp, Trash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DocumentUploadFormProps {
  file: File | null;
  setFile: (file: File | null) => void;
  isEditMode: boolean;
  existingDocumentId: string | null;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

const DocumentUploadForm = ({
  file,
  setFile,
  isEditMode,
  existingDocumentId,
  isSubmitting,
  onBack,
  onSubmit
}: DocumentUploadFormProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditMode ? 'Upload Dokumen Revisi' : 'Upload Dokumen'}
        </CardTitle>
        <CardDescription>
          {isEditMode 
            ? 'Upload dokumen revisi proposal KP Anda dalam format PDF' 
            : 'Upload dokumen proposal KP Anda dalam format PDF'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditMode && existingDocumentId && (
          <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-4">
            <p className="text-blue-700 text-sm">
              Dokumen proposal sebelumnya sudah tersimpan. Anda dapat mengganti dokumen dengan mengunggah yang baru.
            </p>
          </div>
        )}
        
        <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
          <FileUp size={40} className="text-gray-400 mb-4" />
          <p className="mb-4 text-sm text-gray-600 text-center">
            {isEditMode 
              ? 'Drag & drop file revisi proposal Anda di sini, atau klik tombol di bawah' 
              : 'Drag & drop file proposal Anda di sini, atau klik tombol di bawah'}
          </p>
          <div className="space-y-2">
            <Label htmlFor="file-upload" className="sr-only">Upload file</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="w-full"
            />
            {file && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setFile(null)}
                >
                  <Trash size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200 flex items-start">
          <AlertCircle className="text-yellow-500 mr-2" size={20} />
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-1">Informasi penting</p>
            <p>
              Dokumen proposal harus dalam format PDF, DOC, atau DOCX dengan ukuran maksimal 5MB.
              Pastikan proposal sudah sesuai dengan template yang tersedia di panduan KP.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Kembali
        </Button>
        <Button 
          onClick={onSubmit}
          className="bg-primary hover:bg-primary/90"
          disabled={isSubmitting || (!file && !isEditMode)}
        >
          {isSubmitting 
            ? 'Memproses...' 
            : isEditMode 
              ? 'Kirim Revisi Proposal' 
              : 'Ajukan Proposal'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentUploadForm;
