
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { TimelineStep } from '@/types/timeline';

interface DesktopTimelineProps {
  steps: TimelineStep[];
  onEditStep: (step: TimelineStep) => void;
}

const DesktopTimeline = ({ steps, onEditStep }: DesktopTimelineProps) => {
  return (
    <div className="relative py-16 px-4">
      {/* Main horizontal line */}
      <div className="absolute h-1 bg-gradient-to-r from-orange-400 to-orange-600 top-1/2 left-0 right-0 transform -translate-y-1/2 rounded-full"></div>
      
      <div className="grid grid-cols-6 gap-2 relative">
        {steps.map((step, index) => (
          <div key={step.id} className="relative px-2">
            {/* Circle marker */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-4 border-orange-500 z-20 flex items-center justify-center">
              <span className="text-xs font-bold">{index + 1}</span>
            </div>
            
            {/* Period (above the line) */}
            <div className={`text-center mb-6 ${index % 2 === 0 ? 'absolute -top-14' : 'absolute -top-14'} left-1/2 transform -translate-x-1/2 w-full px-2`}>
              <div className="bg-orange-100 text-orange-800 rounded-full px-3 py-1 text-xs font-medium inline-block">
                {step.period}
              </div>
            </div>
            
            {/* Title and description (alternating above/below) */}
            <div className={`${index % 2 === 0 ? 'mt-8' : '-mt-24'} transition-all duration-300`}>
              <div className="bg-white rounded-lg border border-gray-200 shadow p-4 mx-auto relative group">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onEditStep(step)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                {step.description && (
                  <p className="text-gray-600 text-sm mt-2">{step.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesktopTimeline;
