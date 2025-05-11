
import { TimelineStep } from '@/types/timeline';
import TimelineCard from './TimelineCard';

interface DesktopTimelineProps {
  steps: TimelineStep[];
  onEditStep?: (step: TimelineStep) => void;
  readOnly?: boolean;
}

const DesktopTimeline = ({ steps, onEditStep, readOnly = false }: DesktopTimelineProps) => {
  return (
    <div className="relative py-10">
      {/* Main horizontal line */}
      <div className="absolute h-1 bg-orange-500 top-24 left-0 right-0"></div>
      
      <div className="grid grid-cols-6 gap-4">
        {/* Timeline circles and period labels */}
        <div className="col-span-6 relative">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center w-full">
                {/* Period label directly above the circle */}
                <div className="mb-4">
                  <div className="bg-orange-100 text-orange-800 rounded-full px-3 py-1 text-xs font-medium">
                    {step.period}
                  </div>
                </div>
                
                {/* Circle with number */}
                <div className="w-8 h-8 bg-white rounded-full border-2 border-orange-500 flex items-center justify-center z-10">
                  <span className="text-orange-600 font-bold">{index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cards below the timeline */}
        <div className="col-span-6 grid grid-cols-6 gap-4 mt-8">
          {steps.map((step, index) => (
            <div key={`card-${step.id}`}>
              <TimelineCard 
                step={step} 
                index={index} 
                onEditStep={onEditStep} 
                variant="desktop" 
                readOnly={readOnly}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesktopTimeline;
