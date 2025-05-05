
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, QrCode, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const DigitalSignature = () => {
  const [activeTab, setActiveTab] = useState('qrcode');
  const [isLoading, setIsLoading] = useState(true);
  const [hasApprovedProposal, setHasApprovedProposal] = useState(false);
  const [supervisorName, setSupervisorName] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSignatureData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Check if user has an approved proposal
        const { data: proposalData, error: proposalError } = await supabase
          .from('proposals')
          .select(`
            id, 
            status,
            supervisor_id
          `)
          .eq('student_id', user.id)
          .eq('status', 'approved')
          .limit(1)
          .maybeSingle();

        if (proposalError && proposalError.code !== 'PGRST116') {
          console.error('Error checking proposal status:', proposalError);
          toast.error('Gagal memeriksa status proposal');
          return;
        }

        // If the proposal exists and is approved
        if (proposalData && proposalData.status === 'approved') {
          setHasApprovedProposal(true);
          
          // If we have a supervisor, fetch their name and signature data
          if (proposalData.supervisor_id) {
            // Fetch supervisor name
            const { data: supervisorData, error: supervisorError } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', proposalData.supervisor_id)
              .single();
              
            if (!supervisorError && supervisorData) {
              setSupervisorName(supervisorData.full_name);
            }
            
            // Fetch digital signature and QR code
            const { data: signatureData, error: signatureError } = await supabase
              .from('digital_signatures')
              .select('signature_url, qr_code_url, status')
              .eq('supervisor_id', proposalData.supervisor_id)
              .eq('status', 'approved')
              .maybeSingle();
              
            if (!signatureError && signatureData) {
              setSignatureUrl(signatureData.signature_url);
              setQrCodeUrl(signatureData.qr_code_url);
            } else {
              console.log('No approved signature found for supervisor');
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignatureData();
  }, [user]);

  const handleDownload = (type: 'qrcode' | 'signature') => {
    const url = type === 'qrcode' ? qrCodeUrl : signatureUrl;
    
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = type === 'qrcode' ? 'qr_code.png' : 'signature.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Berhasil mengunduh ${type === 'qrcode' ? 'QR Code' : 'Tanda Tangan Digital'}`);
    } else {
      toast.error(`${type === 'qrcode' ? 'QR Code' : 'Tanda Tangan Digital'} belum tersedia`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-gray-500">Memeriksa status proposal...</p>
      </div>
    );
  }

  if (!hasApprovedProposal) {
    return (
      <Alert className="max-w-lg mx-auto">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <AlertTitle className="text-amber-500 font-medium">Akses Tidak Tersedia</AlertTitle>
        <AlertDescription className="text-gray-600">
          Anda belum dapat mengakses tanda tangan digital dan QR Code karena proposal KP Anda belum disetujui.
          Silakan ajukan proposal KP terlebih dahulu atau hubungi koordinator KP jika Anda yakin ini adalah kesalahan.
        </AlertDescription>
      </Alert>
    );
  }

  // Show a message if signature or QR code are not available
  if (!signatureUrl && !qrCodeUrl) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Digital Signature</h1>
        <p className="text-gray-600">
          Download tanda tangan digital dan QR code untuk dokumen KP Anda
        </p>
        
        <Alert className="max-w-lg mx-auto">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <AlertTitle className="text-amber-500 font-medium">Tanda Tangan Belum Tersedia</AlertTitle>
          <AlertDescription className="text-gray-600">
            Dosen pembimbing Anda belum mengupload tanda tangan digital atau tanda tangan belum disetujui.
            Silakan hubungi dosen pembimbing Anda untuk mengupload tanda tangan digital.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Digital Signature</h1>
      <p className="text-gray-600">
        Download tanda tangan digital dan QR code untuk dokumen KP Anda
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qrcode">QR Code</TabsTrigger>
          <TabsTrigger value="signature">Tanda Tangan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="qrcode">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Validasi</CardTitle>
              <CardDescription>
                QR Code ini dapat digunakan untuk memvalidasi dokumen KP Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-6">
              <div className="border p-4 rounded-lg">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code Validasi" 
                    className="w-64 h-64 object-contain"
                  />
                ) : (
                  <div className="w-64 h-64 flex flex-col items-center justify-center bg-gray-100 rounded">
                    <QrCode className="text-gray-400 h-16 w-16 mb-4" />
                    <p className="text-gray-500 text-center px-4">
                      QR Code belum tersedia. Silakan hubungi dosen pembimbing.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                onClick={() => handleDownload('qrcode')}
                className="bg-primary hover:bg-primary/90"
                disabled={!qrCodeUrl}
              >
                <Download size={16} className="mr-2" /> Download QR Code
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="signature">
          <Card>
            <CardHeader>
              <CardTitle>Tanda Tangan Digital</CardTitle>
              <CardDescription>
                Tanda tangan digital dosen pembimbing untuk dokumen KP Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 flex flex-col items-center">
                <div className="mb-4 p-6 bg-gray-50 rounded-lg">
                  {signatureUrl ? (
                    <img 
                      src={signatureUrl} 
                      alt="Digital Signature" 
                      className="w-64 object-contain"
                    />
                  ) : (
                    <div className="w-64 h-32 flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500">Tanda tangan belum tersedia</p>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <Avatar className="h-12 w-12 mx-auto mb-2">
                    <AvatarImage src="/placeholder.svg" alt={supervisorName} />
                    <AvatarFallback>{supervisorName ? supervisorName.charAt(0) : 'D'}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{supervisorName || "Dosen Pembimbing"}</p>
                  <p className="text-sm text-gray-600">Dosen Pembimbing KP</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                onClick={() => handleDownload('signature')}
                className="bg-primary hover:bg-primary/90"
                disabled={!signatureUrl}
              >
                <Download size={16} className="mr-2" /> Download Tanda Tangan
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="max-w-2xl mx-auto bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex items-start">
          <QrCode size={24} className="text-blue-500 mr-3 mt-1" />
          <div>
            <h3 className="font-medium text-blue-700">Petunjuk Penggunaan</h3>
            <p className="text-sm text-blue-600 mt-1">
              Tempelkan QR Code dan tanda tangan digital pada dokumen KP Anda di tempat yang sesuai. 
              QR Code ini akan digunakan untuk memvalidasi keaslian dokumen dan tanda tangan digital 
              dosen pembimbing Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalSignature;
