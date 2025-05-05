
import React from 'react';
import { Button } from "@/components/ui/button";
import { QrCode } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface QRCodeValidationProps {
  hasSignature: boolean;
  status: string | undefined;
  qrCodeUrl: string | undefined;
}

const QRCodeValidation = ({ hasSignature, status, qrCodeUrl }: QRCodeValidationProps) => {
  const [showQRDialog, setShowQRDialog] = React.useState(false);

  return (
    <div className="border-t pt-6">
      <h2 className="text-lg font-medium mb-4">QR Code Validasi</h2>
      
      {hasSignature ? (
        <div className="bg-gray-50 p-6 rounded-lg border flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 border p-4 bg-white rounded">
            {status === 'approved' && qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
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
              {status === 'approved' ? 
                'QR Code ini dapat digunakan untuk memvalidasi dokumen KP mahasiswa yang Anda bimbing.' :
                'QR Code validasi akan tersedia setelah tanda tangan Anda disetujui oleh Super Admin.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                disabled={status !== 'approved' || !qrCodeUrl}
                onClick={() => setShowQRDialog(true)}
              >
                <QrCode size={16} className="mr-1" /> 
                {status === 'approved' && qrCodeUrl ? 'Lihat QR Code' : 'QR Code Sedang Diproses'}
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

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code Validasi</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {qrCodeUrl && (
              <img 
                src={qrCodeUrl} 
                alt="QR Code Validation" 
                className="w-64 h-64 object-contain border p-2"
              />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              Scan QR code ini untuk memvalidasi dokumen
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                if (qrCodeUrl) {
                  window.open(qrCodeUrl, '_blank');
                }
              }}
              className="mt-2"
            >
              Buka di Tab Baru
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QRCodeValidation;
