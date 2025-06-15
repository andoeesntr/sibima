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

import { SignatureInfoSection } from './SignatureInfoSection';
import { SignatureStatusSection } from './SignatureStatusSection';
import { SignatureImageSection } from './SignatureImageSection';
import { SignatureQrSection } from './SignatureQrSection';

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
          <SignatureInfoSection supervisor={signature.supervisor} />
          <SignatureStatusSection status={signature.status} updated_at={signature.updated_at} formatDate={formatDate} />
          <SignatureImageSection signature_url={signature.signature_url} />
          {(signature.status === 'approved' && signature.qr_code_url) && (
            <SignatureQrSection qr_code_url={signature.qr_code_url} />
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
