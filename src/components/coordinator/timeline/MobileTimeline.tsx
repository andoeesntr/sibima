
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
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
            <TimelineCard 
              step={step} 
              index={index} 
              onEditStep={onEditStep} 
              variant="mobile" 
            />
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
