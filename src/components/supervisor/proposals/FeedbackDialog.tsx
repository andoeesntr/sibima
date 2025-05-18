
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Send } from 'lucide-react';

export interface FeedbackDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSendFeedback: (feedback: string) => Promise<boolean>;
  proposalTitle?: string;
  // Allow these props for backward compatibility
  proposalId?: string;
  content?: string;
  setContent?: (content: string) => void;
  isSubmitting?: boolean;
  onSubmit?: () => Promise<boolean>;
}

const FeedbackDialog = ({ 
  isOpen, 
  onOpenChange, 
  onSendFeedback, 
  proposalTitle,
  // Handle legacy props
  content: externalContent,
  setContent: externalSetContent,
  isSubmitting: externalIsSubmitting,
  onSubmit
}: FeedbackDialogProps) => {
  const [internalFeedback, setInternalFeedback] = useState('');
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);

  // Determine which values to use
  const feedback = externalContent !== undefined ? externalContent : internalFeedback;
  const setFeedback = externalSetContent || setInternalFeedback;
  const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting;

  const handleSendFeedback = async () => {
    if (onSubmit) {
      return await onSubmit();
    }

    setInternalIsSubmitting(true);
    const success = await onSendFeedback(feedback);
    
    if (success) {
      setInternalFeedback('');
      onOpenChange(false);
    }
    
    setInternalIsSubmitting(false);
    return success;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Berikan Feedback</DialogTitle>
          <DialogDescription>
            Berikan feedback untuk proposal {proposalTitle ? `"${proposalTitle}"` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea 
            placeholder="Masukkan feedback Anda di sini..." 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={6}
          />
        </div>
        <DialogFooter className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleSendFeedback}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Mengirim...' : (
              <>
                <Send size={16} className="mr-1" /> Kirim Feedback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
