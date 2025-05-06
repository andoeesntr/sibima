
import { TimelineStep } from '@/types/timeline';

export interface TimelineDisplayProps {
  steps: TimelineStep[];
  onEditStep: (step: TimelineStep) => void;
}
