
import { TimelineStep } from '@/types/timeline';
import TimelineCard from './TimelineCard';

interface DesktopTimelineProps {
  steps: TimelineStep[];
  onEditStep: (step: TimelineStep) => void;
}

const DesktopTimeline = ({ steps, onEditStep }: DesktopTimelineProps) => {
  return (
    <div className="relative py-10">
      {/* Main horizontal line */}
      <div className="absolute h-2 bg-orange-500 top-16 left-0 right-0"></div>
      
      <div className="grid grid-cols-6 gap-2 relative">
        {steps.map((step, index) => (
          <div key={step.id} className="relative px-2">
            {/* Period label above the line */}
            <div className="text-center mb-2 absolute w-full top-0 left-0">
              <div className="bg-orange-100 text-orange-800 rounded-full px-3 py-1 text-xs font-medium inline-block">
                {step.period}
              </div>
            </div>
            
            {/* Step number in circle - on the timeline */}
            <div className="absolute left-1/2 top-16 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-2 border-orange-500 z-10 flex items-center justify-center">
              <span className="text-orange-600 font-bold">{index + 1}</span>
            </div>
            
            {/* Card below the line */}
            <div className="mt-20">
              <TimelineCard 
                step={step} 
                index={index} 
                onEditStep={onEditStep} 
                variant="desktop" 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesktopTimeline;
