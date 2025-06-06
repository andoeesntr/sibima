
import React from 'react';
import { Button } from "@/components/ui/button";
import { QrCode, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface QRCodeValidationProps {
  hasSignature: boolean;
  status: string | undefined;
  qrCodeUrl: string | undefined;
}

const QRCodeValidation = ({ hasSignature, status, qrCodeUrl }: QRCodeValidationProps) => {
  const [showQRDialog, setShowQRDialog] = React.useState(false);

  console.log("QR Code URL:", qrCodeUrl);
  console.log("Signature status:", status);
  console.log("Has signature:", hasSignature);

  const downloadQRCode = async () => {
    if (!qrCodeUrl) {
      console.log("No QR code URL available for download");
      return;
    }
    
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'qr-code-validasi-with-logo.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const isApproved = status === 'approved';
  const hasQrCode = qrCodeUrl && qrCodeUrl !== 'undefined';

  return (
    <div className="border-t pt-6">
      <h2 className="text-lg font-medium mb-4">QR Code Validasi dengan Logo</h2>
      
      {hasSignature ? (
        <div className="bg-gray-50 p-6 rounded-lg border flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 border p-4 bg-white rounded-lg shadow-sm">
            {isApproved && hasQrCode ? (
              <div className="relative">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code Validation with Logo" 
                  className="w-40 h-40 object-contain"
                  onError={(e) => {
                    console.error('Error loading QR code image:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Logo overlay for visual reference */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border">
                    <img 
                      src="/LogoSI-removebg-preview.png" 
                      alt="Logo SI" 
                      className="w-8 h-8 object-contain opacity-90"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-40 h-40 flex items-center justify-center bg-gray-100 rounded">
                <QrCode className="text-gray-400 h-16 w-16" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <p className="font-medium mb-2">QR Code Validasi dengan Logo SI</p>
            <p className="text-gray-600 text-sm mb-4">
              {isApproved && hasQrCode ? 
                'QR Code dengan logo SI di tengah untuk memvalidasi dokumen KP mahasiswa yang Anda bimbing.' :
                isApproved ? 
                'QR Code dengan logo sedang diproses. Refresh halaman dalam beberapa saat.' :
                'QR Code validasi dengan logo akan tersedia setelah tanda tangan Anda disetujui oleh Super Admin.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                disabled={!isApproved || !hasQrCode}
                onClick={() => {
                  console.log("QR Code button clicked", { isApproved, hasQrCode, qrCodeUrl });
                  if (isApproved && hasQrCode) {
                    setShowQRDialog(true);
                  }
                }}
                className="text-green-600 border-green-600"
              >
                <QrCode size={16} className="mr-1" /> 
                {isApproved && hasQrCode ? 'Lihat QR Code' : 'QR Code Belum Tersedia'}
              </Button>
              
              {isApproved && hasQrCode && (
                <Button 
                  variant="outline"
                  onClick={downloadQRCode}
                  className="text-blue-600 border-blue-600"
                >
                  <Download size={16} className="mr-1" />
                  Download QR Code
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg border">
          <QrCode className="mx-auto h-10 w-10 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900">QR Code belum tersedia</h3>
          <p className="text-gray-500 max-w-md mx-auto mt-2">
            Upload tanda tangan digital Anda terlebih dahulu untuk mendapatkan QR Code validasi dengan logo SI
          </p>
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code Validasi dengan Logo SI</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {hasQrCode && (
              <div className="relative">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code Validation with Logo" 
                  className="w-64 h-64 object-contain border p-2 rounded"
                  onError={(e) => {
                    console.error('Error loading QR code in dialog:', e);
                  }}
                />
                {/* Logo overlay for dialog */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md border-2">
                    <img 
                      src="/LogoSI-removebg-preview.png" 
                      alt="Logo SI" 
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Scan QR code ini untuk memvalidasi dokumen dengan logo SI
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (qrCodeUrl) {
                    window.open(qrCodeUrl, '_blank');
                  }
                }}
              >
                Buka di Tab Baru
              </Button>
              <Button 
                variant="outline"
                onClick={downloadQRCode}
                className="text-blue-600 border-blue-600"
              >
                <Download size={16} className="mr-1" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QRCodeValidation;
