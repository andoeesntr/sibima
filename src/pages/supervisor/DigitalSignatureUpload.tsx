import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileImage, QrCode, Trash, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';
import { uploadSignature, saveSignatureToDatabase, deleteSignature } from '@/services/signatureService';
import { useSignatureStatus } from '@/hooks/useSignatureStatus';
import SignatureUploadArea from '@/components/signatures/SignatureUploadArea';
import SignatureStatusDisplay from '@/components/signatures/SignatureStatusDisplay';
import QRCodeValidation from '@/components/signatures/QRCodeValidation';
import SignatureUploadGuidelines from '@/components/signatures/SignatureUploadGuidelines';

const DigitalSignatureUpload = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [signature, setSignature] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { signatureStatus, isLoading, refetchSignatureStatus } = useSignatureStatus();

  const hasSignature = signatureStatus.signature_url !== null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSignature(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePreview = () => {
    setSignature(null);
    setPreviewUrl(null);
  };

  const validateFile = (file: File): string | null => {
    if (file.size > 1024 * 1024) {
      return 'Ukuran file terlalu besar. Maksimal 1MB';
    }
    
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Format file tidak didukung. Gunakan PNG, JPEG atau GIF';
    }

    return null;
  };

  const handleUpload = async () => {
    if (!signature || !user) {
      toast.error('Harap pilih file tanda tangan terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const validationError = validateFile(signature);
      if (validationError) {
        toast.error(validationError);
        return;
      }
      
      console.log('Starting signature upload process...');
      
      const publicUrl = await uploadSignature(signature, user.id);
      console.log('Signature uploaded successfully to storage. Public URL:', publicUrl);
      
      await saveSignatureToDatabase(user.id, publicUrl);
      console.log('Signature saved to database successfully');
      
      toast.success('Tanda tangan berhasil diupload dan disimpan');
      
      // Refresh signature status
      await refetchSignatureStatus();
      
      // Clear preview and switch to status tab
      setSignature(null);
      setPreviewUrl(null);
      setActiveTab('status');
      
    } catch (error: any) {
      console.error('Error uploading signature:', error);
      toast.error(`Gagal mengupload tanda tangan: ${error.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteSignature(user.id);
      
      // Refresh signature status
      await refetchSignatureStatus();
      
      setSignature(null);
      setPreviewUrl(null);
      toast.success('Tanda tangan berhasil dihapus');
      setActiveTab('upload');
      
    } catch (error) {
      console.error('Error deleting signature:', error);
      toast.error('Gagal menghapus tanda tangan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestUpload = () => {
    setActiveTab('upload');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Tanda Tangan Digital</h1>
      <p className="text-gray-600">
        Upload tanda tangan digital Anda yang akan digunakan pada dokumen KP mahasiswa
      </p>

      <Alert className="bg-blue-50 border-blue-200">
        <QrCode className="h-5 w-5 text-blue-500" />
        <AlertTitle className="text-blue-700">Informasi</AlertTitle>
        <AlertDescription className="text-blue-600">
          Setelah tanda tangan diupload, tanda tangan akan diproses oleh Super Admin untuk 
          pembuatan QR Code validasi yang akan digunakan oleh mahasiswa.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Tanda Tangan</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Tanda Tangan</CardTitle>
              <CardDescription>
                Upload gambar tanda tangan Anda dengan latar belakang transparan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SignatureUploadArea 
                previewUrl={previewUrl}
                onFileChange={handleFileChange}
                onRemove={handleRemovePreview}
              />
              
              <SignatureUploadGuidelines />
            </CardContent>
            <CardFooter>
              <Button 
                className="ml-auto bg-primary hover:bg-primary/90"
                onClick={handleUpload}
                disabled={!signature || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <UploadCloud size={16} className="animate-bounce mr-1" />
                    Mengupload...
                  </>
                ) : (
                  'Upload Tanda Tangan'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Status Tanda Tangan Digital</CardTitle>
              <CardDescription>
                Informasi tentang tanda tangan digital Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SignatureStatusDisplay
                status={signatureStatus.status}
                previewUrl={signatureStatus.signature_url}
                onRequestUpload={handleRequestUpload}
                onDelete={handleDelete}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <QRCodeValidation 
        hasSignature={hasSignature}
        qrCodeUrl={signatureStatus.qr_code_url}
        status={signatureStatus.status}
      />
    </div>
  );
};

export default DigitalSignatureUpload;
