
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { TimelineStep } from '@/types/timeline';

interface TimelineCardProps {
  step: TimelineStep;
  index: number;
  onEditStep?: (step: TimelineStep) => void;
  onDeleteStep?: (stepId: string) => void;
  variant: 'mobile' | 'desktop';
  readOnly?: boolean;
}

const formatDescriptionWithLinks = (description: string) => {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  const parts = description.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const TimelineCard = ({ step, index, onEditStep, onDeleteStep, variant, readOnly = false }: TimelineCardProps) => {
  if (variant === 'mobile') {
    return (
      <div className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white relative group">
        {!readOnly && (onEditStep || onDeleteStep) && (
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            {onEditStep && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onEditStep(step)}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDeleteStep && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDeleteStep(step.id)}
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        
        <div className="flex items-center mb-2">
          <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
            <span className="text-orange-600 font-bold">{index + 1}</span>
          </div>
          <h3 className="font-semibold text-lg ml-3">{step.title}</h3>
        </div>
        
        {step.description && (
          <p className="text-gray-600 text-sm">
            {formatDescriptionWithLinks(step.description)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white relative group h-full">
      {!readOnly && (onEditStep || onDeleteStep) && (
        <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {onEditStep && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEditStep(step)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDeleteStep && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDeleteStep(step.id)}
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      
      <h3 className="font-bold text-gray-900 mb-3 text-base">{step.title}</h3>
      
      {step.description && (
        <p className="text-gray-600 text-sm leading-relaxed">
          {formatDescriptionWithLinks(step.description)}
        </p>
      )}
    </div>
  );
};

export default TimelineCard;
