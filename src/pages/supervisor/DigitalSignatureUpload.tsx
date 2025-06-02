
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Import refactored components
import SignatureUploadArea from '@/components/signatures/SignatureUploadArea';
import SignatureUploadGuidelines from '@/components/signatures/SignatureUploadGuidelines';
import SignatureStatusDisplay from '@/components/signatures/SignatureStatusDisplay';
import QRCodeValidation from '@/components/signatures/QRCodeValidation';
import { uploadSignature, saveSignatureToDatabase, deleteSignature } from '@/services/signatureService';

const DigitalSignatureUpload = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [signature, setSignature] = useState<File | null>(null);
  const [hasUploadedSignature, setHasUploadedSignature] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [signatureData, setSignatureData] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSignatureData();
    }
  }, [user]);

  const fetchSignatureData = async () => {
    if (!user) return;

    try {
      console.log('Fetching signature data for user:', user.id);
      
      const { data, error } = await supabase
        .from('digital_signatures')
        .select('*')
        .eq('supervisor_id', user.id)
        .not('status', 'eq', 'deleted')
        .maybeSingle();

      console.log('Signature data fetch result:', { data, error });

      if (error) {
        console.error('Error fetching signature data:', error);
        throw error;
      }

      if (data) {
        console.log('Found signature data:', data);
        setSignatureData(data);
        setHasUploadedSignature(true);
        setPreviewUrl(data.signature_url);
      } else {
        console.log('No signature data found');
        setSignatureData(null);
        setHasUploadedSignature(false);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Error fetching signature data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSignature(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size (1MB limit)
    if (file.size > 1024 * 1024) {
      return 'Ukuran file terlalu besar. Maksimal 1MB';
    }
    
    // Validate file type
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
      // Validate file
      const validationError = validateFile(signature);
      if (validationError) {
        toast.error(validationError);
        return;
      }
      
      console.log('Starting signature upload process...');
      
      // Upload signature and get public URL
      const publicUrl = await uploadSignature(signature, user.id);
      console.log('Signature uploaded successfully to storage. Public URL:', publicUrl);
      
      // Save to database
      await saveSignatureToDatabase(user.id, publicUrl);
      console.log('Signature saved to database successfully');
      
      toast.success('Tanda tangan berhasil diupload dan disimpan');
      
      // Update local state immediately
      const newSignatureData = { 
        signature_url: publicUrl, 
        status: 'pending',
        supervisor_id: user.id,
        id: Date.now().toString() // temporary ID
      };
      setSignatureData(newSignatureData);
      setHasUploadedSignature(true);
      setActiveTab('status');
      
      // Refresh signature data from database after a short delay
      setTimeout(() => {
        fetchSignatureData();
      }, 2000);
      
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
      
      setHasUploadedSignature(false);
      setSignature(null);
      setPreviewUrl(null);
      setSignatureData(null);
      toast.success('Tanda tangan berhasil dihapus');
      setActiveTab('upload');
      
    } catch (error) {
      console.error('Error deleting signature:', error);
      toast.error('Gagal menghapus tanda tangan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tanda Tangan Digital</h1>
          <p className="text-gray-600">
            Upload tanda tangan digital Anda yang akan digunakan pada dokumen KP mahasiswa
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchSignatureData}
          disabled={loadingData}
        >
          {loadingData ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

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
                onRemove={() => {
                  setSignature(null);
                  setPreviewUrl(null);
                }} 
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
                status={signatureData?.status}
                previewUrl={previewUrl}
                onRequestUpload={() => setActiveTab('upload')}
                onDelete={handleDelete}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <QRCodeValidation 
        hasSignature={hasUploadedSignature}
        status={signatureData?.status} 
        qrCodeUrl={signatureData?.qr_code_url}
      />
    </div>
  );
};

export default DigitalSignatureUpload;
