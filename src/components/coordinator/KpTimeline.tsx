
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { TimelineStep } from '@/types/timeline';
import { fetchTimelineSteps, updateTimelineStep } from '@/services/timelineService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';

const KpTimeline = () => {
  const [steps, setSteps] = useState<TimelineStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState<TimelineStep | null>(null);
  
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadTimelineSteps = async () => {
      setLoading(true);
      try {
        const data = await fetchTimelineSteps();
        setSteps(data);
      } catch (error) {
        console.error("Failed to fetch timeline steps:", error);
        toast.error("Failed to load timeline data");
      } finally {
        setLoading(false);
      }
    };

    loadTimelineSteps();
  }, []);

  const handleEditClick = (step: TimelineStep) => {
    setCurrentStep(step);
    setOpenDialog(true);
  };

  const handleSaveStep = async () => {
    if (!currentStep) return;

    try {
      const updatedStep = await updateTimelineStep(currentStep);
      if (updatedStep) {
        setSteps(steps.map(step => step.id === updatedStep.id ? updatedStep : step));
        setOpenDialog(false);
      }
    } catch (error) {
      console.error("Failed to update timeline step:", error);
      toast.error("Failed to update timeline step");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline Kerja Praktik</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-center">Loading timeline...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Timeline Kerja Praktik</CardTitle>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <MobileTimeline steps={steps} onEditStep={handleEditClick} />
        ) : (
          <DesktopTimeline steps={steps} onEditStep={handleEditClick} />
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Timeline Step</DialogTitle>
          </DialogHeader>
          
          {currentStep && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={currentStep.title}
                  onChange={(e) => setCurrentStep({...currentStep, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Input
                  id="period"
                  value={currentStep.period}
                  onChange={(e) => setCurrentStep({...currentStep, period: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentStep.description || ''}
                  onChange={(e) => setCurrentStep({...currentStep, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button onClick={handleSaveStep}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

interface TimelineDisplayProps {
  steps: TimelineStep[];
  onEditStep: (step: TimelineStep) => void;
}

const DesktopTimeline = ({ steps, onEditStep }: TimelineDisplayProps) => {
  return (
    <div className="relative py-8 px-4">
      {/* Main horizontal line */}
      <div className="absolute h-2 bg-gradient-to-r from-orange-400 to-orange-600 top-1/2 left-0 right-0 transform -translate-y-1/2 rounded-full"></div>
      
      <div className="grid grid-cols-6 relative">
        {steps.map((step, index) => (
          <div key={step.id} className="relative px-2">
            {/* Circle marker */}
            <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-4 border-orange-500 z-10 flex items-center justify-center">
              <span className="text-xs font-bold">{index + 1}</span>
            </div>
            
            {/* Content - alternating top/bottom */}
            <div className={`mt-8 ${index % 2 === 0 ? '' : 'md:-mt-32'}`}>
              <div className="bg-white rounded-lg border border-gray-200 shadow p-4 mx-auto relative group">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onEditStep(step)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <span className="text-orange-500 font-bold text-sm block mb-1">{step.period}</span>
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

const MobileTimeline = ({ steps, onEditStep }: TimelineDisplayProps) => {
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
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <span className="text-orange-500 font-medium text-sm">{step.period}</span>
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

export default KpTimeline;
