
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, QrCode, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Placeholder image for QR code
const qrImageUrl = "/lovable-uploads/cf1cd298-5ceb-4140-9045-4486c2030e4e.png";

const DigitalSignature = () => {
  const [activeTab, setActiveTab] = useState('qrcode');
  const [isLoading, setIsLoading] = useState(true);
  const [hasApprovedProposal, setHasApprovedProposal] = useState(false);

  useEffect(() => {
    // Simulate API call to check if proposal is approved
    setTimeout(() => {
      setIsLoading(false);
      // For demo purposes, we'll set this to true
      setHasApprovedProposal(true);
    }, 1000);
  }, []);

  const handleDownload = (type: 'qrcode' | 'signature') => {
    toast.success(`Berhasil mengunduh ${type === 'qrcode' ? 'QR Code' : 'Tanda Tangan Digital'}`);
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
        <AlertTitle className="text-amber-500 font-medium">Akses Tidak Tersedia</AlertTitle>
        <AlertDescription className="text-gray-600">
          Anda belum dapat mengakses tanda tangan digital dan QR Code karena proposal KP Anda belum disetujui.
          Silakan ajukan proposal KP terlebih dahulu.
        </AlertDescription>
      </Alert>
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
                <img 
                  src={qrImageUrl} 
                  alt="QR Code Validasi" 
                  className="w-64 h-64 object-contain"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                onClick={() => handleDownload('qrcode')}
                className="bg-primary hover:bg-primary/90"
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
                  <img 
                    src="/placeholder.svg" 
                    alt="Digital Signature" 
                    className="w-64 object-contain"
                  />
                </div>
                <div className="text-center">
                  <p className="font-medium">Dr. Agus Dosen</p>
                  <p className="text-sm text-gray-600">Dosen Pembimbing KP</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                onClick={() => handleDownload('signature')}
                className="bg-primary hover:bg-primary/90"
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
