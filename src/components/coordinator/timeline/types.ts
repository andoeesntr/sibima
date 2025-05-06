
import { TimelineStep } from '@/types/timeline';

export interface TimelineDisplayProps {
  steps: TimelineStep[];
  onEditStep: (step: TimelineStep) => void;
}

export interface TimelineEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStep: TimelineStep | null;
  onStepChange: (step: TimelineStep) => void;
  onSave: () => void;
  updating?: boolean;
}
