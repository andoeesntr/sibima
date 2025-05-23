
import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveProposalFeedback, saveDocumentToAllTeamProposals } from "@/services/proposalService";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { FileUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  proposalId: string;
  onFeedbackSaved: () => void;
}

const FeedbackDialog = ({
  isOpen,
  setIsOpen,
  proposalId,
  onFeedbackSaved
}: FeedbackDialogProps) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!feedback.trim() && !file) {
      toast.error('Harap masukkan feedback atau unggah dokumen');
      return;
    }

    setIsSubmitting(true);
    try {
      // Handle document upload first if provided
      let documentUrl = '';
      let documentName = '';
      let documentType = '';

      if (file && user) {
        const fileName = `${Date.now()}_${file.name}`;
        const fileExt = fileName.split('.').pop() || '';
        const filePath = `${user.id}/${proposalId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('proposal-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          });

        if (uploadError) {
          toast.error('Gagal mengunggah file');
          console.error("Error uploading file:", uploadError);
        } else {
          // Get public URL
          const { data: publicURLData } = supabase.storage
            .from('proposal-documents')
            .getPublicUrl(filePath);

          if (publicURLData?.publicUrl) {
            documentUrl = publicURLData.publicUrl;
            documentName = fileName;
            documentType = fileExt;

            // Save document to all team members' proposals
            await saveDocumentToAllTeamProposals(
              proposalId,
              documentUrl,
              documentName,
              documentType,
              user.id
            );
          }
        }
      }

      // Save feedback if provided
      if (feedback.trim() && user) {
        await saveProposalFeedback(proposalId, user.id, feedback);
      }

      toast.success('Feedback berhasil disimpan');
      setFeedback('');
      setFile(null);
      setIsOpen(false);
      onFeedbackSaved();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error('Gagal menyimpan feedback');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Berikan Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea
              id="feedback"
              placeholder="Tuliskan feedback Anda disini..."
              className="min-h-[100px]"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="document">Unggah Dokumen (opsional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="document"
                type="file"
                onChange={handleFileChange}
              />
              {file && <span className="text-sm text-gray-500">{file.name}</span>}
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-end">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Memproses...' : 'Kirim Feedback'}
            {isSubmitting && <FileUp className="ml-1 h-4 w-4 animate-bounce" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
