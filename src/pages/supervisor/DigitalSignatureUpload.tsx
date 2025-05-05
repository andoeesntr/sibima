
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileImage, QrCode, Trash, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Placeholder image for QR code
const qrImageUrl = "/lovable-uploads/cf1cd298-5ceb-4140-9045-4486c2030e4e.png";

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
      const { data, error } = await supabase
        .from('digital_signatures')
        .select('*')
        .eq('supervisor_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSignatureData(data);
        setHasUploadedSignature(true);
        setPreviewUrl(data.signature_url);
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

  const handleUpload = async () => {
    if (!signature || !user) {
      toast.error('Harap pilih file tanda tangan terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload file to Supabase Storage
      const fileExt = signature.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `signatures/${fileName}`;
      
      // Upload to storage
      const { error: storageError, data: storageData } = await supabase
        .storage
        .from('signatures')
        .upload(filePath, signature, {
          upsert: true
        });
        
      if (storageError) throw storageError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('signatures')
        .getPublicUrl(filePath);
        
      // Save to database
      const { data: existingSignature } = await supabase
        .from('digital_signatures')
        .select()
        .eq('supervisor_id', user.id)
        .maybeSingle();
        
      if (existingSignature) {
        const { error: updateError } = await supabase
          .from('digital_signatures')
          .update({
            signature_url: publicUrl,
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('supervisor_id', user.id);
          
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('digital_signatures')
          .insert({
            supervisor_id: user.id,
            signature_url: publicUrl,
            status: 'pending'
          });
          
        if (insertError) throw insertError;
      }
      
      toast.success('Tanda tangan berhasil diupload');
      setHasUploadedSignature(true);
      setSignatureData({ signature_url: publicUrl, status: 'pending' });
      setActiveTab('status');
      
    } catch (error) {
      console.error('Error uploading signature:', error);
      toast.error('Gagal mengupload tanda tangan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Delete from database
      const { error } = await supabase
        .from('digital_signatures')
        .delete()
        .eq('supervisor_id', user.id);
        
      if (error) throw error;
      
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
              <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                {previewUrl ? (
                  <div className="mb-4 flex flex-col items-center">
                    <img 
                      src={previewUrl} 
                      alt="Signature Preview" 
                      className="max-h-40 object-contain mb-4" 
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSignature(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <Trash size={14} className="mr-1" /> Hapus
                    </Button>
                  </div>
                ) : (
                  <>
                    <FileImage size={40} className="text-gray-400 mb-4" />
                    <p className="mb-4 text-sm text-gray-600 text-center">
                      Drag & drop file tanda tangan Anda di sini, atau klik tombol di bawah
                    </p>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signature-upload" className="sr-only">Upload tanda tangan</Label>
                  <Input
                    id="signature-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded border text-sm">
                <h3 className="font-medium mb-2">Panduan Upload Tanda Tangan</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Gunakan gambar tanda tangan dengan latar belakang transparan (format PNG)</li>
                  <li>Ukuran file tidak lebih dari 1MB</li>
                  <li>Resolusi yang disarankan: 300 DPI</li>
                  <li>Pastikan tanda tangan terlihat jelas dan tidak buram</li>
                </ul>
              </div>
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
              {hasUploadedSignature ? (
                <>
                  <div className="flex justify-center">
                    <div className="border p-6 rounded-lg bg-gray-50 max-w-xs">
                      <img 
                        src={previewUrl || "/placeholder.svg"} 
                        alt="Digital Signature" 
                        className="h-32 object-contain mx-auto"
                      />
                      <p className="text-center mt-4 text-sm text-gray-600">
                        Tanda tangan yang saat ini aktif
                      </p>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded border flex items-start ${
                    signatureData?.status === 'approved' ? 'bg-green-50 border-green-100' : 
                    signatureData?.status === 'rejected' ? 'bg-red-50 border-red-100' : 
                    'bg-yellow-50 border-yellow-100'
                  }`}>
                    <div className={`${
                      signatureData?.status === 'approved' ? 'text-green-800' : 
                      signatureData?.status === 'rejected' ? 'text-red-800' : 
                      'text-yellow-800'
                    }`}>
                      <p className="font-medium">
                        {signatureData?.status === 'approved' ? 'Tanda tangan disetujui' :
                         signatureData?.status === 'rejected' ? 'Tanda tangan ditolak' :
                         'Tanda tangan sedang diproses'}
                      </p>
                      <p className="text-sm mt-1">
                        {signatureData?.status === 'approved' ? 
                          'Tanda tangan digital Anda telah disetujui dan QR Code telah dibuat.' :
                        signatureData?.status === 'rejected' ? 
                          'Tanda tangan digital Anda ditolak. Silakan upload tanda tangan baru.' :
                          'Tanda tangan digital Anda sedang diproses oleh Super Admin untuk pembuatan QR Code validasi.'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-yellow-50 p-4 rounded border border-yellow-100 flex items-start">
                  <div className="text-yellow-800">
                    <p className="font-medium">Belum ada tanda tangan</p>
                    <p className="text-sm mt-1">
                      Anda belum mengupload tanda tangan digital. Silakan upload tanda tangan 
                      pada tab "Upload Tanda Tangan".
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            {hasUploadedSignature && (
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="mr-auto"
                  onClick={() => setActiveTab('upload')}
                >
                  Upload Baru
                </Button>
                
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menghapus...' : 'Hapus Tanda Tangan'}
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <div className="border-t pt-6">
        <h2 className="text-lg font-medium mb-4">QR Code Validasi</h2>
        
        {hasUploadedSignature ? (
          <div className="bg-gray-50 p-6 rounded-lg border flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 border p-4 bg-white rounded">
              {signatureData?.status === 'approved' && signatureData?.qr_code_url ? (
                <img 
                  src={signatureData.qr_code_url} 
                  alt="QR Code Validation" 
                  className="w-40 h-40 object-contain"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center bg-gray-100">
                  <QrCode className="text-gray-400 h-16 w-16" />
                </div>
              )}
            </div>
            
            <div>
              <p className="font-medium mb-2">QR Code Validasi Dosen</p>
              <p className="text-gray-600 text-sm mb-4">
                {signatureData?.status === 'approved' ? 
                  'QR Code ini dapat digunakan untuk memvalidasi dokumen KP mahasiswa yang Anda bimbing.' :
                  'QR Code validasi akan tersedia setelah tanda tangan Anda disetujui oleh Super Admin.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  disabled={signatureData?.status !== 'approved'}
                  onClick={() => {
                    if (signatureData?.qr_code_url) {
                      window.open(signatureData.qr_code_url);
                    }
                  }}
                >
                  <QrCode size={16} className="mr-1" /> 
                  {signatureData?.status === 'approved' ? 'Lihat QR Code' : 'QR Code Sedang Diproses'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg border">
            <QrCode className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900">QR Code belum tersedia</h3>
            <p className="text-gray-500 max-w-md mx-auto mt-2">
              Upload tanda tangan digital Anda terlebih dahulu untuk mendapatkan QR Code validasi
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalSignatureUpload;
