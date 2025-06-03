
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { fetchSignatures, approveSignature, rejectSignature } from '@/services/signatureAdminService';
import SignatureTable from '@/components/admin/digital-signatures/SignatureTable';
import SignatureViewDialog from '@/components/admin/digital-signatures/SignatureViewDialog';

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

const DigitalSignatureManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [signatures, setSignatures] = useState<DigitalSignature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSignature, setSelectedSignature] = useState<DigitalSignature | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  useEffect(() => {
    loadSignatures();
  }, []);

  const loadSignatures = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSignatures();
      setSignatures(data);
    } catch (error) {
      toast.error('Gagal memuat data tanda tangan digital');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSignature = (signature: DigitalSignature) => {
    setSelectedSignature(signature);
    setIsViewDialogOpen(true);
  };

  const handleApproveSignature = async (signatureId: string) => {
    try {
      setIsGeneratingQr(true);
      
      // Find the signature in the local state
      const signature = signatures.find(sig => sig.id === signatureId);
      if (!signature) {
        throw new Error("Signature not found");
      }
      
      // Call the service to approve the signature and generate QR code
      const { qr_code_url } = await approveSignature(
        signatureId,
        signature.supervisor.id,
        signature.supervisor.name
      );
      
      // Update local state to show status as approved
      setSignatures(signatures.map(sig => 
        sig.id === signatureId ? { ...sig, status: 'approved', qr_code_url } : sig
      ));
      
      if (selectedSignature && selectedSignature.id === signatureId) {
        setSelectedSignature({
          ...selectedSignature,
          status: 'approved',
          qr_code_url
        });
      }

      toast.success('Tanda tangan berhasil disetujui dan QR Code dibuat');
    } catch (error) {
      console.error('Error approving signature:', error);
      toast.error('Gagal menyetujui tanda tangan');
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleRejectSignature = async (signatureId: string) => {
    try {
      await rejectSignature(signatureId);

      // Update local state
      setSignatures(signatures.map(sig => 
        sig.id === signatureId ? { ...sig, status: 'rejected' } : sig
      ));
      
      if (selectedSignature && selectedSignature.id === signatureId) {
        setSelectedSignature({
          ...selectedSignature,
          status: 'rejected'
        });
      }

      toast.success('Tanda tangan berhasil ditolak');
    } catch (error) {
      toast.error('Gagal menolak tanda tangan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Tanda Tangan Digital</h1>
          <p className="text-gray-600">Kelola tanda tangan digital dosen</p>
        </div>
        
        <div className="relative flex-1 sm:w-64 max-w-sm">
          <Input
            placeholder="Cari dosen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tanda Tangan Digital</CardTitle>
          <CardDescription>Kelola dan validasi tanda tangan digital dosen</CardDescription>
        </CardHeader>
        <CardContent>
          <SignatureTable 
            signatures={signatures}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onViewSignature={handleViewSignature}
            onApproveSignature={handleApproveSignature}
            onRejectSignature={handleRejectSignature}
          />
        </CardContent>
      </Card>

      <SignatureViewDialog 
        signature={selectedSignature}
        isOpen={isViewDialogOpen}
        isGeneratingQr={isGeneratingQr}
        onOpenChange={setIsViewDialogOpen}
        onApprove={handleApproveSignature}
        onReject={handleRejectSignature}
      />
    </div>
  );
};

export default DigitalSignatureManagement;
