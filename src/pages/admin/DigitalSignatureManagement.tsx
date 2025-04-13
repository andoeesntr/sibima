
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Check, CheckCircle, Download, FileText, QrCode, Search, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type SignatureStatus = "pending" | "approved" | "rejected";

interface Supervisor {
  id: string;
  name: string;
  nip: string;
  department: string;
}

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

  useEffect(() => {
    fetchSignatures();
  }, []);

  const fetchSignatures = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('digital_signatures')
        .select(`
          id, 
          status,
          signature_url,
          qr_code_url,
          created_at,
          updated_at,
          supervisor_id,
          profiles:supervisor_id (
            id, 
            full_name,
            nip,
            department
          )
        `);

      if (error) throw error;

      // Transform data to match our DigitalSignature interface
      const transformedData = data.map((signature: any) => ({
        id: signature.id,
        supervisor: {
          id: signature.profiles.id,
          name: signature.profiles.full_name || 'Unnamed Supervisor',
          nip: signature.profiles.nip || '-',
          department: signature.profiles.department || '-'
        },
        status: signature.status as SignatureStatus,
        signature_url: signature.signature_url,
        qr_code_url: signature.qr_code_url,
        created_at: signature.created_at,
        updated_at: signature.updated_at
      }));

      setSignatures(transformedData);
    } catch (error) {
      console.error('Error fetching signatures:', error);
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
      const { error } = await supabase
        .from('digital_signatures')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', signatureId);

      if (error) throw error;

      // Update local state
      setSignatures(signatures.map(sig => 
        sig.id === signatureId ? { ...sig, status: 'approved' } : sig
      ));

      toast.success('Tanda tangan berhasil disetujui');
      
      // Create activity log
      await supabase.from('activity_logs').insert({
        user_id: '0', // System user or should be replaced with actual admin ID
        user_name: 'Admin',
        action: 'menyetujui tanda tangan digital',
        target_type: 'signature',
        target_id: signatureId
      });

    } catch (error) {
      console.error('Error approving signature:', error);
      toast.error('Gagal menyetujui tanda tangan');
    }
  };

  const handleRejectSignature = async (signatureId: string) => {
    try {
      const { error } = await supabase
        .from('digital_signatures')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', signatureId);

      if (error) throw error;

      // Update local state
      setSignatures(signatures.map(sig => 
        sig.id === signatureId ? { ...sig, status: 'rejected' } : sig
      ));

      toast.success('Tanda tangan berhasil ditolak');
      
      // Create activity log
      await supabase.from('activity_logs').insert({
        user_id: '0', // System user or should be replaced with actual admin ID
        user_name: 'Admin',
        action: 'menolak tanda tangan digital',
        target_type: 'signature',
        target_id: signatureId
      });

    } catch (error) {
      console.error('Error rejecting signature:', error);
      toast.error('Gagal menolak tanda tangan');
    }
  };

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
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
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
                              onClick={() => handleViewSignature(signature)}
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
                                  onClick={() => handleApproveSignature(signature.id)}
                                >
                                  <Check size={16} />
                                  <span className="sr-only">Approve</span>
                                </Button>
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600" 
                                  onClick={() => handleRejectSignature(signature.id)}
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
          )}
        </CardContent>
      </Card>

      {/* Signature View Dialog */}
      {selectedSignature && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Detail Tanda Tangan Digital</DialogTitle>
              <DialogDescription>
                Tanda tangan digital untuk {selectedSignature.supervisor.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Informasi Dosen</h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-500">Nama:</span> {selectedSignature.supervisor.name}</p>
                  <p><span className="text-gray-500">NIP:</span> {selectedSignature.supervisor.nip}</p>
                  <p><span className="text-gray-500">Department:</span> {selectedSignature.supervisor.department}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Status</h3>
                <div className="flex items-center">
                  {selectedSignature.status === 'approved' && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Disetujui pada {formatDate(selectedSignature.updated_at)}</span>
                    </div>
                  )}
                  
                  {selectedSignature.status === 'rejected' && (
                    <div className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span>Ditolak pada {formatDate(selectedSignature.updated_at)}</span>
                    </div>
                  )}
                  
                  {selectedSignature.status === 'pending' && (
                    <div className="flex items-center text-yellow-600">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>Menunggu persetujuan</span>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedSignature.signature_url && (
                <div>
                  <h3 className="font-medium mb-2">Tanda Tangan</h3>
                  <div className="border p-4 rounded-md flex justify-center">
                    <img 
                      src={selectedSignature.signature_url} 
                      alt="Digital Signature" 
                      className="max-h-40 object-contain"
                    />
                  </div>
                </div>
              )}
              
              {selectedSignature.status === 'approved' && selectedSignature.qr_code_url && (
                <div>
                  <h3 className="font-medium mb-2">QR Code</h3>
                  <div className="border p-4 rounded-md flex justify-center">
                    <img 
                      src={selectedSignature.qr_code_url} 
                      alt="QR Code" 
                      className="max-h-40 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex items-center justify-between sm:justify-end">
              {selectedSignature.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600"
                    onClick={() => {
                      handleRejectSignature(selectedSignature.id);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <XCircle size={16} className="mr-2" />
                    Tolak
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApproveSignature(selectedSignature.id);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Setujui
                  </Button>
                </div>
              )}
              
              {selectedSignature.status === 'approved' && selectedSignature.qr_code_url && (
                <Button
                  variant="outline"
                  className="text-blue-600 border-blue-600"
                  onClick={() => window.open(selectedSignature.qr_code_url, '_blank')}
                >
                  <Download size={16} className="mr-2" />
                  Unduh QR Code
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DigitalSignatureManagement;
