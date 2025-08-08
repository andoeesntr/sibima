
import { TimelineStep } from '@/types/timeline';
import TimelineCard from './TimelineCard';

interface DesktopTimelineProps {
  steps: TimelineStep[];
  onEditStep?: (step: TimelineStep) => void;
  onDeleteStep?: (stepId: string) => void;
  readOnly?: boolean;
}

const DesktopTimeline = ({ steps, onEditStep, onDeleteStep, readOnly = false }: DesktopTimelineProps) => {
  // Pastikan tidak error jika steps kosong
  if (!steps || steps.length === 0) return null;

  return (
    <div className="relative py-6 w-full overflow-x-auto">
      <div className="min-w-max px-4">
        {/* Main horizontal line */}
        <div className="absolute h-1 bg-orange-500 top-20 left-4 right-4 z-0"></div>
        
        <div className="w-full">
          {/* Timeline circles and period labels */}
          <div className="relative mb-8">
            <div className="flex items-center gap-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center min-w-[160px]">
                  {/* Period label directly above the circle */}
                  <div className="mb-4">
                    <div className="bg-orange-100 text-orange-800 rounded-full px-2 py-1 text-xs font-medium text-center">
                      {step.period}
                    </div>
                  </div>
                  {/* Circle with number */}
                  <div className="w-8 h-8 bg-white rounded-full border-2 border-orange-500 flex items-center justify-center z-10">
                    <span className="text-orange-600 font-bold text-sm">{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cards below the timeline */}
          <div className="w-full">
            <div className="flex gap-4">
              {steps.map((step, index) => (
                <div 
                  key={`card-${step.id}`} 
                  className="w-[160px] flex-shrink-0"
                >
                  <TimelineCard 
                    step={step} 
                    index={index} 
                    onEditStep={onEditStep} 
                    onDeleteStep={onDeleteStep}
                    variant="desktop" 
                    readOnly={readOnly}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopTimeline;
