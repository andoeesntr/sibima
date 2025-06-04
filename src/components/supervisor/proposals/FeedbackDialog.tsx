
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
  setIsOpen?: (open: boolean) => void;
  proposalId?: string;
  onFeedbackSaved?: () => void;
  // New props to match Dashboard and Feedback pages usage
  onOpenChange?: (open: boolean) => void;
  proposalTitle?: string;
  onSendFeedback?: (feedback: string) => Promise<boolean>;
  content?: string;
  setContent?: (content: string) => void;
  isSubmitting?: boolean;
  onSubmit?: () => Promise<boolean>;
}

const FeedbackDialog = ({
  isOpen,
  setIsOpen,
  proposalId,
  onFeedbackSaved,
  onOpenChange,
  proposalTitle,
  onSendFeedback,
  content,
  setContent,
  isSubmitting: externalIsSubmitting,
  onSubmit: externalOnSubmit
}: FeedbackDialogProps) => {
  // Use internal state if external state is not provided
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { user } = useAuth();

  // Handle both patterns: controlled externally or internally
  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else if (setIsOpen) {
      setIsOpen(open);
    }
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (setContent) {
      setContent(e.target.value);
    } else {
      setFeedback(e.target.value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    // If external submission handler is provided, use that
    if (externalOnSubmit) {
      return externalOnSubmit();
    }

    // Otherwise use internal handler
    if (onSendFeedback && content !== undefined) {
      // Validate that there is content to send
      if (!content.trim()) {
        toast.error('Harap masukkan feedback');
        return false;
      }
      
      // Use the provided onSendFeedback function with the content
      const success = await onSendFeedback(content);
      if (success && setContent) {
        setContent(''); // Clear the content after successful submission
        handleOpenChange(false); // Close dialog after successful submission
      }
      return success;
    }

    // Default internal implementation for direct proposal feedback
    const currentFeedback = content !== undefined ? content : feedback;
    
    // Fixed validation: only require feedback content, file is optional
    if (!currentFeedback.trim()) {
      toast.error('Harap masukkan feedback');
      return false;
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

            // Fixed function call with correct parameters
            await saveDocumentToAllTeamProposals(
              proposalId!,
              documentUrl,
              documentName,
              documentType,
              user.id
            );
          }
        }
      }

      // Save feedback if provided
      if (currentFeedback.trim() && user && proposalId) {
        await saveProposalFeedback(proposalId, user.id, currentFeedback);
      }

      toast.success('Feedback berhasil disimpan');
      
      // Clear form
      if (content !== undefined && setContent) {
        setContent('');
      } else {
        setFeedback('');
      }
      setFile(null);
      
      if (setIsOpen) setIsOpen(false);
      if (onFeedbackSaved) onFeedbackSaved();
      return true;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error('Gagal menyimpan feedback');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const currentFeedback = content !== undefined ? content : feedback;
  const isCurrentlySubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : isSubmitting;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
              value={currentFeedback}
              onChange={handleFeedbackChange}
            />
          </div>
          {/* Only show file upload if not externally controlled */}
          {!onSendFeedback && (
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
          )}
        </div>
        <DialogFooter className="flex justify-between sm:justify-end">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)} 
            disabled={isCurrentlySubmitting}
          >
            Batal
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90" 
            onClick={handleSubmit}
            disabled={isCurrentlySubmitting || !currentFeedback.trim()}
          >
            {isCurrentlySubmitting ? 'Memproses...' : 'Kirim Feedback'}
            {isCurrentlySubmitting && <FileUp className="ml-1 h-4 w-4 animate-bounce" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
