
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Download, Eye, FileImage, QrCode, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DigitalSignature {
  id: string;
  supervisor: {
    id: string;
    name: string;
    nip: string;
    department: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  qr_code_url?: string;
}

const DigitalSignatureManagement = () => {
  const [signatures, setSignatures] = useState<DigitalSignature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewSignature, setViewSignature] = useState<DigitalSignature | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Placeholder image for signature preview
  const placeholderSignatureUrl = "/placeholder.svg";
  // Placeholder image for QR code
  const qrImageUrl = "/lovable-uploads/cf1cd298-5ceb-4140-9045-4486c2030e4e.png";

  // Fetch digital signatures from Supabase
  useEffect(() => {
    const fetchSignatures = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch from a digital_signatures table
        // For now, fetch supervisors and create mock data
        const { data: supervisors, error } = await supabase
          .from('profiles')
          .select('id, full_name, nip, department')
          .eq('role', 'supervisor');
          
        if (error) throw error;
        
        // Create mock signatures based on supervisors
        const mockSignatures = supervisors.map((supervisor: any) => ({
          id: `sig-${supervisor.id}`,
          supervisor: {
            id: supervisor.id,
            name: supervisor.full_name || 'No Name',
            nip: supervisor.nip || 'No NIP',
            department: supervisor.department || 'No Department'
          },
          status: Math.random() > 0.5 ? 'approved' : 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          qr_code_url: Math.random() > 0.5 ? qrImageUrl : undefined
        }));
        
        setSignatures(mockSignatures);
      } catch (error) {
        console.error('Error fetching signatures:', error);
        toast.error('Failed to load digital signatures');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSignatures();
  }, []);

  const handleApprove = (signature: DigitalSignature) => {
    // Update signature status
    const updatedSignatures = signatures.map(sig => {
      if (sig.id === signature.id) {
        return {
          ...sig,
          status: 'approved' as const,
          qr_code_url: qrImageUrl, // In a real app, you would generate QR
          updated_at: new Date().toISOString()
        };
      }
      return sig;
    });
    
    setSignatures(updatedSignatures);
    toast.success(`Tanda tangan ${signature.supervisor.name} telah disetujui`);
  };

  const handleReject = (signature: DigitalSignature) => {
    // Update signature status
    const updatedSignatures = signatures.map(sig => {
      if (sig.id === signature.id) {
        return {
          ...sig,
          status: 'rejected' as const,
          updated_at: new Date().toISOString()
        };
      }
      return sig;
    });
    
    setSignatures(updatedSignatures);
    toast.success(`Tanda tangan ${signature.supervisor.name} telah ditolak`);
  };

  const handleViewSignature = (signature: DigitalSignature) => {
    setViewSignature(signature);
    setIsPreviewOpen(true);
  };

  const handleDownloadQR = (signature: DigitalSignature) => {
    if (!signature.qr_code_url) {
      toast.error('QR Code belum tersedia');
      return;
    }
    
    // In a real app, trigger download of QR code
    toast.success(`QR Code untuk ${signature.supervisor.name} berhasil diunduh`);
  };

  const filteredSignatures = signatures.filter(signature => {
    // Filter by status
    if (filter !== 'all' && signature.status !== filter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      return (
        signature.supervisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        signature.supervisor.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        signature.supervisor.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manajemen Tanda Tangan Digital</h1>
      <p className="text-gray-600">
        Validasi dan kelola tanda tangan digital dosen untuk dokumen KP
      </p>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Cari berdasarkan nama, NIP, atau department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Semua
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
          >
            Menunggu
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
            className={filter === 'approved' ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            Disetujui
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
            className={filter === 'rejected' ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            Ditolak
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Tanda Tangan Digital</CardTitle>
          <CardDescription>
            {filter === 'all' ? 'Semua tanda tangan digital' : 
             filter === 'pending' ? 'Tanda tangan yang menunggu persetujuan' : 
             filter === 'approved' ? 'Tanda tangan yang sudah disetujui' : 
             'Tanda tangan yang ditolak'}
          </CardDescription>
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
                    <TableHead>Dosen</TableHead>
                    <TableHead>NIP</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Upload</TableHead>
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
                        <TableCell>
                          {signature.status === 'pending' && (
                            <Badge className="bg-yellow-500">Menunggu</Badge>
                          )}
                          {signature.status === 'approved' && (
                            <Badge className="bg-green-500">Disetujui</Badge>
                          )}
                          {signature.status === 'rejected' && (
                            <Badge className="bg-red-500">Ditolak</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(signature.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewSignature(signature)}
                            >
                              <Eye size={14} className="mr-1" /> Lihat
                            </Button>
                            
                            {signature.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600"
                                  onClick={() => handleApprove(signature)}
                                >
                                  <Check size={14} className="mr-1" /> Setujui
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(signature)}
                                >
                                  <X size={14} className="mr-1" /> Tolak
                                </Button>
                              </>
                            )}
                            
                            {signature.status === 'approved' && signature.qr_code_url && (
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadQR(signature)}
                              >
                                <Download size={14} className="mr-1" /> QR Code
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <FileImage className="mx-auto h-10 w-10 opacity-30 mb-2" />
                        <p>Tidak ada tanda tangan yang ditemukan</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preview Tanda Tangan Digital</DialogTitle>
            <DialogDescription>
              {viewSignature?.supervisor.name} - {viewSignature?.supervisor.nip}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">Tanda Tangan</h3>
              <div className="bg-gray-50 p-4 rounded flex items-center justify-center">
                <img 
                  src={placeholderSignatureUrl} 
                  alt="Digital Signature" 
                  className="max-h-32"
                />
              </div>
            </div>
            
            {viewSignature?.qr_code_url && (
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">QR Code</h3>
                <div className="bg-gray-50 p-4 rounded flex items-center justify-center">
                  <img 
                    src={viewSignature.qr_code_url} 
                    alt="QR Code" 
                    className="max-h-32"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p><span className="font-medium">Status:</span> {
                viewSignature?.status === 'pending' ? 'Menunggu Persetujuan' :
                viewSignature?.status === 'approved' ? 'Disetujui' :
                'Ditolak'
              }</p>
              <p><span className="font-medium">Tanggal Upload:</span> {viewSignature && formatDate(viewSignature.created_at)}</p>
              {viewSignature?.status === 'approved' && (
                <p><span className="font-medium">Tanggal Persetujuan:</span> {viewSignature && formatDate(viewSignature.updated_at)}</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DigitalSignatureManagement;
