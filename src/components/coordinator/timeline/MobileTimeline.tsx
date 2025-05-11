
import { Button } from '@/components/ui/button';
import { TimelineStep } from '@/types/timeline';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import TimelineCard from './TimelineCard';

interface MobileTimelineProps {
  steps: TimelineStep[];
  onEditStep: (step: TimelineStep) => void;
}

const MobileTimeline = ({ steps, onEditStep }: MobileTimelineProps) => {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {steps.map((step, index) => (
          <CarouselItem key={step.id}>
            <div className="pt-10 pb-6 px-2 relative">
              {/* Period above the card */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mb-2">
                <div className="bg-orange-100 text-orange-800 rounded-full px-3 py-1 text-xs font-medium">
                  {step.period}
                </div>
              </div>
              
              <TimelineCard 
                step={step} 
                index={index} 
                onEditStep={onEditStep} 
                variant="mobile" 
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center mt-4 gap-2">
        <CarouselPrevious className="relative inset-auto transform-none" />
        <CarouselNext className="relative inset-auto transform-none" />
      </div>
    </Carousel>
  );
};

export default MobileTimeline;
