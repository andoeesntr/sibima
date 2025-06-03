
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TimelineStep } from '@/types/timeline';
import { toast } from 'sonner';

interface TimelineEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStep: TimelineStep | null;
  onSave: (step: TimelineStep) => Promise<void>;
  isSubmitting: boolean;
}

const TimelineEditDialog = ({ 
  open, 
  onOpenChange, 
  currentStep, 
  onSave, 
  isSubmitting 
}: TimelineEditDialogProps) => {
  const [step, setStep] = useState<TimelineStep | null>(currentStep);

  // Update the step whenever currentStep changes
  if (currentStep !== null && (step === null || step.id !== currentStep.id)) {
    setStep({...currentStep});
  }

  const handleSaveStep = async () => {
    if (!step || !step.title || !step.period) {
      toast.error("Title and period are required");
      return;
    }
    
    await onSave(step);
  };

  if (!step) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Timeline Step</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={step.title}
              onChange={(e) => setStep({...step, title: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Input
              id="period"
              value={step.period}
              onChange={(e) => setStep({...step, period: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={step.description || ''}
              onChange={(e) => setStep({...step, description: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveStep} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimelineEditDialog;
