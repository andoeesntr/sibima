
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Check, XCircle, QrCode, Search } from 'lucide-react';

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

interface SignatureTableProps {
  signatures: DigitalSignature[];
  isLoading: boolean;
  searchQuery: string;
  onViewSignature: (signature: DigitalSignature) => void;
  onApproveSignature: (signatureId: string) => void;
  onRejectSignature: (signatureId: string) => void;
}

const SignatureTable: React.FC<SignatureTableProps> = ({
  signatures,
  isLoading,
  searchQuery,
  onViewSignature,
  onApproveSignature,
  onRejectSignature
}) => {
  const filteredSignatures = signatures.filter(signature => {
    if (searchQuery) {
      const supervisorName = signature.supervisor.name.toLowerCase();
      const supervisorNip = signature.supervisor.nip.toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      return supervisorName.includes(searchLower) || supervisorNip.includes(searchLower);
    }
    return true;
  });

  const getStatusBadge = (status: SignatureStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Disetujui</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Ditolak</Badge>;
      default:
        return <Badge className="bg-yellow-500">Menunggu</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Dosen</TableHead>
            <TableHead>NIP</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tanggal Pengajuan</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSignatures.length > 0 ? (
            filteredSignatures.map((signature) => (
              <TableRow key={signature.id}>
                <TableCell className="font-medium">{signature.supervisor.name}</TableCell>
                <TableCell>{signature.supervisor.nip}</TableCell>
                <TableCell>{signature.supervisor.department}</TableCell>
                <TableCell>{getStatusBadge(signature.status)}</TableCell>
                <TableCell>{formatDate(signature.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewSignature(signature)}
                    >
                      <FileText size={16} />
                      <span className="sr-only">View</span>
                    </Button>
                    
                    {signature.status === 'pending' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600" 
                          onClick={() => onApproveSignature(signature.id)}
                        >
                          <Check size={16} />
                          <span className="sr-only">Approve</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600" 
                          onClick={() => onRejectSignature(signature.id)}
                        >
                          <XCircle size={16} />
                          <span className="sr-only">Reject</span>
                        </Button>
                      </>
                    )}
                    
                    {signature.status === 'approved' && signature.qr_code_url && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => window.open(signature.qr_code_url, '_blank')}
                      >
                        <QrCode size={16} />
                        <span className="sr-only">QR Code</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                {searchQuery ? (
                  <div className="flex flex-col items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Tidak ada hasil untuk "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Belum ada tanda tangan digital yang diajukan</p>
                  </div>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SignatureTable;
