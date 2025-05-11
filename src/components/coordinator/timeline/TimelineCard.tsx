
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { TimelineStep } from '@/types/timeline';

interface TimelineCardProps {
  step: TimelineStep;
  index: number;
  onEditStep: (step: TimelineStep) => void;
  variant: 'mobile' | 'desktop';
}

const TimelineCard = ({ step, index, onEditStep, variant }: TimelineCardProps) => {
  if (variant === 'mobile') {
    return (
      <div className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white relative group">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onEditStep(step)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
            <span className="text-orange-600 font-bold">{index + 1}</span>
          </div>
          <h3 className="font-semibold text-lg ml-3">{step.title}</h3>
        </div>
        
        {step.description && (
          <p className="text-gray-600 text-sm">{step.description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 h-auto min-h-[150px] relative group">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onEditStep(step)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
      
      {step.description && (
        <p className="text-gray-600 text-sm">{step.description}</p>
      )}
    </div>
  );
};

export default TimelineCard;
