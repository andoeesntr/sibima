
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

  // Set grid cols amount sesuai step
  const colCount = steps.length > 6 ? 6 : steps.length;
  const gridCols = `grid-cols-${colCount}`;

  return (
    <div className="relative py-10 w-full">
      {/* Main horizontal line */}
      <div className="absolute h-1 bg-orange-500 top-24 left-0 right-0 z-0"></div>
      
      <div className={`grid w-full ${gridCols} gap-4`}>
        {/* Timeline circles and period labels */}
        <div className={`col-span-${colCount} relative`}>
          <div className="flex justify-between w-full">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
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
        <div className={`col-span-${colCount} w-full mt-8`}>
          <div className={`flex w-full gap-6`}>
            {steps.map((step, index) => (
              <div 
                key={`card-${step.id}`} 
                className="flex-1 min-w-0"
                style={{ maxWidth: `${100 / steps.length}%` }}
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
  );
};

export default DesktopTimeline;

