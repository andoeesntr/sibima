
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { TimelineStep } from '@/types/timeline';
import { fetchTimelineSteps, updateTimelineStep } from '@/services/timelineService';
import { toast } from 'sonner';
import DesktopTimeline from './timeline/DesktopTimeline';
import MobileTimeline from './timeline/MobileTimeline';
import TimelineEditDialog from './timeline/TimelineEditDialog';

const KpTimeline = () => {
  const [steps, setSteps] = useState<TimelineStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState<TimelineStep | null>(null);
  const [updating, setUpdating] = useState(false);
  
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
    setCurrentStep({...step});
    setOpenDialog(true);
  };

  const handleStepChange = (step: TimelineStep) => {
    setCurrentStep(step);
  };

  const handleSaveStep = async () => {
    if (!currentStep) return;
    
    try {
      setUpdating(true);
      const updatedStep = await updateTimelineStep(currentStep);
      
      if (updatedStep) {
        setSteps(steps.map(step => step.id === updatedStep.id ? updatedStep : step));
        setOpenDialog(false);
        setCurrentStep(null);
      }
    } catch (error) {
      console.error("Failed to update timeline step:", error);
    } finally {
      setUpdating(false);
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

      <TimelineEditDialog 
        open={openDialog}
        onOpenChange={setOpenDialog}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onSave={handleSaveStep}
        updating={updating}
      />
    </Card>
  );
};

export default KpTimeline;
