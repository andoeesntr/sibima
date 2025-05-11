
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
      <div className="absolute h-1 bg-orange-500 top-20 left-0 right-0"></div>
      
      {/* Period labels above the timeline */}
      <div className="flex justify-between mb-2 px-4">
        {steps.map((step) => (
          <div key={`period-${step.id}`} className="text-center">
            <div className="bg-orange-100 text-orange-800 rounded-full px-3 py-1 text-xs font-medium inline-block">
              {step.period}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline with step numbers and cards */}
      <div className="relative">
        {/* Step numbers in circles */}
        <div className="flex justify-between px-16">
          {steps.map((step, index) => (
            <div 
              key={`circle-${step.id}`} 
              className="w-8 h-8 bg-white rounded-full border-2 border-orange-500 flex items-center justify-center z-10"
            >
              <span className="text-orange-600 font-bold">{index + 1}</span>
            </div>
          ))}
        </div>

        {/* Cards below the timeline */}
        <div className="grid grid-cols-6 gap-4 mt-8">
          {steps.map((step, index) => (
            <div key={`card-${step.id}`} className="flex flex-col">
              <TimelineCard 
                step={step} 
                index={index} 
                onEditStep={onEditStep} 
                variant="desktop" 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesktopTimeline;
