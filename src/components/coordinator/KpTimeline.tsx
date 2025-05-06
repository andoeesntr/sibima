
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { TimelineStep } from '@/types/timeline';
import { fetchTimelineSteps, updateTimelineStep } from '@/services/timelineService';
import { toast } from 'sonner';
import MobileTimeline from './timeline/MobileTimeline';
import DesktopTimeline from './timeline/DesktopTimeline';
import TimelineEditDialog from './timeline/TimelineEditDialog';
import TimelineSkeleton from './timeline/TimelineSkeleton';

const KpTimeline = () => {
  const [steps, setSteps] = useState<TimelineStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState<TimelineStep | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isMobile = useIsMobile();

  useEffect(() => {
    loadTimelineSteps();
  }, []);

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

  const handleEditClick = (step: TimelineStep) => {
    setCurrentStep({...step});
    setOpenDialog(true);
  };

  const handleSaveStep = async (step: TimelineStep) => {
    setIsSubmitting(true);
    try {
      const updatedStep = await updateTimelineStep(step);
      if (updatedStep) {
        setSteps(steps.map(s => s.id === updatedStep.id ? updatedStep : s));
        setOpenDialog(false);
        toast.success("Timeline step updated successfully");
      }
    } catch (error) {
      console.error("Failed to update timeline step:", error);
      toast.error("Failed to update timeline step");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Timeline Kerja Praktik</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <TimelineSkeleton isMobile={isMobile} />
        ) : (
          isMobile ? (
            <MobileTimeline steps={steps} onEditStep={handleEditClick} />
          ) : (
            <DesktopTimeline steps={steps} onEditStep={handleEditClick} />
          )
        )}
      </CardContent>

      <TimelineEditDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        currentStep={currentStep}
        onSave={handleSaveStep}
        isSubmitting={isSubmitting}
      />
    </Card>
  );
};

export default KpTimeline;
