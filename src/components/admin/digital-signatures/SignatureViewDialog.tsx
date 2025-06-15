import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, FileText, XCircle } from 'lucide-react';

interface Supervisor {
  id: string;
  name: string;
  nip: string;
  department: string;
}

type SignatureStatus = "pending" | "approved" | "rejected";

interface DigitalSignature {
  id: string;
  supervisor: Supervisor;
  status: SignatureStatus;
  signature_url?: string;
  qr_code_url?: string;
  created_at: string;
  updated_at: string;
}

interface SignatureViewDialogProps {
  signature: DigitalSignature | null;
  isOpen: boolean;
  isGeneratingQr: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (signatureId: string) => void;
  onReject: (signatureId: string) => void;
}

const SignatureViewDialog: React.FC<SignatureViewDialogProps> = ({
  signature,
  isOpen,
  isGeneratingQr,
  onOpenChange,
  onApprove,
  onReject
}) => {
  if (!signature) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detail Tanda Tangan Digital</DialogTitle>
          <DialogDescription>
            Tanda tangan digital untuk {signature.supervisor.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Informasi Dosen</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-500">Nama:</span> {signature.supervisor.name}</p>
              <p><span className="text-gray-500">NIP:</span> {signature.supervisor.nip}</p>
              <p><span className="text-gray-500">Department:</span> {signature.supervisor.department}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Status</h3>
            <div className="flex items-center">
              {signature.status === 'approved' && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Disetujui pada {formatDate(signature.updated_at)}</span>
                </div>
              )}
              
              {signature.status === 'rejected' && (
                <div className="flex items-center text-red-600">
                  <XCircle className="h-4 w-4 mr-1" />
                  <span>Ditolak pada {formatDate(signature.updated_at)}</span>
                </div>
              )}
              
              {signature.status === 'pending' && (
                <div className="flex items-center text-yellow-600">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>Menunggu persetujuan</span>
                </div>
              )}
            </div>
          </div>
          
          {signature.signature_url && (
            <div>
              <h3 className="font-medium mb-2">Tanda Tangan</h3>
              <div className="border p-4 rounded-md flex justify-center">
                <img 
                  src={signature.signature_url} 
                  alt="Digital Signature" 
                  className="max-h-40 object-contain"
                />
              </div>
            </div>
          )}
          
          {signature.status === 'approved' && signature.qr_code_url && (
            <div>
              <h3 className="font-medium mb-2">QR Code</h3>
              <div className="border p-4 rounded-md flex justify-center">
                <div className="relative w-40 h-40 flex items-center justify-center bg-white rounded">
                  {/* QR Code image as base */}
                  <img 
                    src={signature.qr_code_url} 
                    alt="QR Code" 
                    className="w-40 h-40 object-contain"
                    style={{ display: "block" }}
                  />
                  {/* Overlay: Lingkaran putih kecil tepat di tengah, ukuran pas logo */}
                  <div className="absolute left-1/2 top-1/2 pointer-events-none"
                       style={{
                         transform: 'translate(-50%, -50%)'
                       }}>
                    {/* Lingkaran putih kecil, ukuran hanya lebih besar sedikit dari logo */}
                    <div
                      className="flex items-center justify-center rounded-full bg-white"
                      style={{
                        width: 44,
                        height: 44, // Lingkaran putih, sangat presisi di tengah (44x44px)
                        boxShadow: '0 0 3px rgba(0,0,0,0.03)'
                      }}
                    >
                      {/* Logo SI transparan, pas di tengah lingkaran */}
                      <img
                        src="/LogoSI-removebg-preview.png"
                        alt="Logo SI"
                        className="object-contain"
                        style={{
                          width: 36, // Logo diameter lebih kecil dari lingkaran
                          height: 36,
                          background: "transparent"
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex items-center justify-between sm:justify-end">
          {signature.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-red-600 border-red-600"
                onClick={() => onReject(signature.id)}
                disabled={isGeneratingQr}
              >
                <XCircle size={16} className="mr-2" />
                Tolak
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onApprove(signature.id)}
                disabled={isGeneratingQr}
              >
                {isGeneratingQr ? (
                  <>Memproses...</>
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Setujui
                  </>
                )}
              </Button>
            </div>
          )}
          
          {signature.status === 'approved' && signature.qr_code_url && (
            <Button
              variant="outline"
              className="text-blue-600 border-blue-600"
              onClick={() => window.open(signature.qr_code_url, '_blank')}
            >
              <Download size={16} className="mr-2" />
              Unduh QR Code
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureViewDialog;
