
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
            <div className="border border-gray-200 rounded-lg p-6 shadow-sm bg-white relative group">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onEditStep(step)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                  <span className="text-orange-600 font-bold">{index + 1}</span>
                </div>
                <div className="ml-4">
                  <span className="text-orange-500 font-medium text-sm block mb-1">{step.period}</span>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                </div>
              </div>
              {step.description && (
                <p className="text-gray-600">{step.description}</p>
              )}
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
