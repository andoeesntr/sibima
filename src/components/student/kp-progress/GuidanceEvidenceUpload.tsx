
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Camera, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface GuidanceEvidenceUploadProps {
  guidanceId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const GuidanceEvidenceUpload = ({ guidanceId, onSuccess, onCancel }: GuidanceEvidenceUploadProps) => {
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      
      // Validate file type (images and PDF)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format file harus gambar (JPG, PNG) atau PDF');
        return;
      }
      
      setEvidenceFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!evidenceFile) {
      toast.error('Harap upload bukti bimbingan');
      return;
    }

    if (!user?.id) {
      toast.error('User tidak ditemukan');
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to Supabase storage
      const fileExt = evidenceFile.name.split('.').pop();
      const fileName = `${user.id}/${guidanceId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('guidance-evidence')
        .upload(fileName, evidenceFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('guidance-evidence')
        .getPublicUrl(fileName);

      // Update guidance record with evidence
      const { error: updateError } = await supabase
        .from('kp_guidance_schedule')
        .update({
          evidence_url: publicUrl,
          evidence_notes: notes,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', guidanceId);

      if (updateError) throw updateError;

      toast.success('Bukti bimbingan berhasil diupload');
      onSuccess();
    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast.error('Gagal mengupload bukti bimbingan');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Upload Bukti Bimbingan
        </CardTitle>
        <CardDescription>
          Upload foto atau dokumen sebagai bukti pelaksanaan bimbingan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="evidence-file">Bukti Bimbingan *</Label>
            <div className="border border-dashed rounded-lg p-6 text-center">
              {evidenceFile ? (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 text-green-500 mx-auto" />
                  <p className="text-sm text-green-700 font-medium">{evidenceFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(evidenceFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">
                    Klik untuk upload atau drag & drop file
                  </p>
                  <p className="text-xs text-gray-500">
                    Format: JPG, PNG, PDF (Max 5MB)
                  </p>
                </div>
              )}
              <Input
                id="evidence-file"
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                onChange={handleFileChange}
                className="mt-4"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Tambahkan catatan tentang bimbingan yang telah dilaksanakan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Panduan Upload Bukti:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Upload foto saat bimbingan berlangsung</li>
              <li>• Atau upload dokumen yang didiskusikan</li>
              <li>• File harus jelas dan dapat dibaca</li>
              <li>• Maksimal ukuran file 5MB</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isUploading || !evidenceFile}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Bukti
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isUploading}
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GuidanceEvidenceUpload;
