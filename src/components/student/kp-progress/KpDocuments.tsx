
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Eye, Plus, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface KpDocument {
  id: string;
  student_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  status: string;
  supervisor_feedback: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

const KpDocuments = () => {
  const [documents, setDocuments] = useState<KpDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const documentTypes = [
    { key: 'proposal', label: 'Proposal KP' },
    { key: 'logbook', label: 'Logbook' },
    { key: 'report_draft', label: 'Draft Laporan' },
    { key: 'final_report', label: 'Laporan Akhir' },
    { key: 'presentation', label: 'Slide Presentasi' },
    { key: 'attachment', label: 'Lampiran' }
  ];

  const ensureBucketExists = async () => {
    try {
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        return false;
      }

      const bucketExists = buckets?.some(bucket => bucket.name === 'kp-documents');
      
      if (!bucketExists) {
        console.log('Creating kp-documents bucket...');
        
        // Try to create bucket using edge function
        const { error: functionError } = await supabase.functions.invoke('upload-file', {
          body: {
            action: 'create_bucket',
            bucket: 'kp-documents'
          }
        });
        
        if (functionError) {
          console.error('Function error creating bucket:', functionError);
          toast.error('Gagal membuat storage bucket');
          return false;
        }
        
        console.log('Bucket created successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      return false;
    }
  };

  const fetchDocuments = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('kp_documents')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Gagal mengambil data dokumen');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!user?.id) return;

    try {
      setIsUploading(true);
      setUploadingType(documentType);

      // Ensure bucket exists first
      const bucketReady = await ensureBucketExists();
      if (!bucketReady) {
        throw new Error('Storage bucket tidak tersedia');
      }

      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType}/${Date.now()}.${fileExt}`;

      console.log('Uploading file:', fileName);

      // Try direct upload first
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('kp-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false
        });

      let publicUrl: string;

      if (uploadError) {
        console.log('Direct upload failed, trying via edge function:', uploadError);
        
        // Use edge function as fallback
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', fileName);
        formData.append('bucket', 'kp-documents');

        const { data: functionData, error: functionError } = await supabase.functions.invoke('upload-file', {
          body: formData
        });

        if (functionError) {
          throw new Error(`Upload failed: ${functionError.message}`);
        }

        publicUrl = functionData.publicUrl;
      } else {
        // Get public URL for direct upload
        const { data: { publicUrl: directUrl } } = supabase.storage
          .from('kp-documents')
          .getPublicUrl(fileName);
        publicUrl = directUrl;
      }

      // Check if document type already exists
      const existingDoc = documents.find(doc => doc.document_type === documentType);
      const version = existingDoc ? existingDoc.version + 1 : 1;

      // Save document record to database
      const { data, error } = await supabase
        .from('kp_documents')
        .insert({
          student_id: user.id,
          uploaded_by: user.id,
          document_type: documentType,
          file_name: file.name,
          file_url: publicUrl,
          version: version,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setDocuments(prev => [data, ...prev]);
      toast.success('Dokumen berhasil diunggah');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(`Gagal mengunggah dokumen: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadingType(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu Review', className: 'bg-yellow-500' },
      approved: { label: 'Disetujui', className: 'bg-green-500' },
      revision_needed: { label: 'Perlu Revisi', className: 'bg-orange-500' },
      rejected: { label: 'Ditolak', className: 'bg-red-500' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.key === type);
    return docType ? docType.label : type;
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Gagal mengunduh file');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Dokumen KP</h2>
          <p className="text-gray-600">Unggah dan kelola dokumen KP Anda</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Unggah Dokumen</CardTitle>
          <CardDescription>Pilih jenis dokumen dan unggah file</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentTypes.map((docType) => (
              <div key={docType.key} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">{docType.label}</h3>
                </div>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadingType(docType.key);
                        handleFileUpload(file, docType.key);
                      }
                    }}
                    disabled={isUploading && uploadingType === docType.key}
                  />
                  {isUploading && uploadingType === docType.key && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Mengunggah...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dokumen Anda</h3>
        
        {documents.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Belum ada dokumen yang diunggah</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {documents.map((document) => (
              <Card key={document.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <h4 className="font-medium">{getDocumentTypeLabel(document.document_type)}</h4>
                        <Badge variant="outline">v{document.version}</Badge>
                        {getStatusBadge(document.status)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">{document.file_name}</p>
                      <p className="text-xs text-gray-500">
                        Diunggah: {format(new Date(document.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                      </p>

                      {document.supervisor_feedback && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-orange-800 text-sm">Feedback Dosen:</span>
                          </div>
                          <p className="text-sm text-orange-700">{document.supervisor_feedback}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(document.file_url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(document.file_url, document.file_name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpDocuments;
