
import React from 'react';
import { TimelineStep } from '@/types/timeline';
import { TimelineEditDialogProps } from './types';
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

const TimelineEditDialog = ({
  open,
  onOpenChange,
  currentStep,
  onStepChange,
  onSave,
  updating = false
}: TimelineEditDialogProps) => {
  if (!currentStep) return null;

  const handleChange = (field: keyof TimelineStep, value: string) => {
    onStepChange({
      ...currentStep,
      [field]: value
    });
  };

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
              value={currentStep.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={updating}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Input
              id="period"
              value={currentStep.period || ''}
              onChange={(e) => handleChange('period', e.target.value)}
              disabled={updating}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={currentStep.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              disabled={updating}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={updating}>
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimelineEditDialog;
