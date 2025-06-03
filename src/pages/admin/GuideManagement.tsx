
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, FileText, MoreHorizontal, PlusCircle, Trash, UploadCloud } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { guideDocuments, formatDate } from '@/services/mockData';
import { toast } from 'sonner';

const GuideManagement = () => {
  const [documents, setDocuments] = useState(guideDocuments);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePreview = (fileUrl: string) => {
    setPreviewUrl(fileUrl);
  };

  const handleDelete = (docId: string) => {
    toast.success('Dokumen berhasil dihapus');
    setDocuments(documents.filter(doc => doc.id !== docId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Panduan KP</h1>
          <p className="text-gray-600">
            Upload dan kelola dokumen panduan kerja praktik untuk mahasiswa
          </p>
        </div>

        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <UploadCloud size={16} className="mr-1" /> Upload Panduan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Dokumen Panduan</DialogTitle>
              <DialogDescription>
                Upload dokumen panduan kerja praktik dalam format PDF
              </DialogDescription>
            </DialogHeader>
            <UploadDocumentForm onClose={() => setIsUploadDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dokumen Panduan</CardTitle>
          <CardDescription>
            Dokumen panduan yang tersedia untuk mahasiswa dan dosen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start gap-4">
                    <FileText className="h-10 w-10 text-blue-500" />
                    <div>
                      <h3 className="font-medium">{doc.title}</h3>
                      <p className="text-sm text-gray-500">
                        Upload: {formatDate(doc.uploadDate)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 max-w-md">
                        {doc.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(doc.fileUrl)}
                    >
                      <Eye size={14} className="mr-1" /> Preview
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal size={16} />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash size={14} className="mr-2" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <h3 className="text-lg font-medium text-gray-900">Tidak ada dokumen</h3>
                <p className="text-gray-500">
                  Belum ada dokumen panduan yang diupload
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
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
    </div>
  );
};

// Upload Document Form Component
const UploadDocumentForm = ({ onClose }: { onClose: () => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!title || !file) {
      toast.error('Harap isi judul dan pilih file untuk diupload');
      return;
    }

    setIsUploading(true);

    // Simulate API call
    setTimeout(() => {
      setIsUploading(false);
      toast.success('Dokumen panduan berhasil diupload');
      onClose();
    }, 1500);
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

export default GuideManagement;
