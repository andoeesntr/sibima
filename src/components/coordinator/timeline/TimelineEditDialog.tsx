
import React from 'react';
import { TimelineStep } from '@/types/timeline';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface TimelineEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStep: TimelineStep | null;
  onStepChange: (step: TimelineStep) => void;
  onSave: () => void;
}

const TimelineEditDialog = ({
  open,
  onOpenChange,
  currentStep,
  onStepChange,
  onSave
}: TimelineEditDialogProps) => {
  if (!currentStep) return null;

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
              value={currentStep.title}
              onChange={(e) => onStepChange({...currentStep, title: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Input
              id="period"
              value={currentStep.period}
              onChange={(e) => onStepChange({...currentStep, period: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={currentStep.description || ''}
              onChange={(e) => onStepChange({...currentStep, description: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={onSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimelineEditDialog;
