
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { TimelineStep } from '@/types/timeline';
import { fetchTimelineSteps, updateTimelineStep, deleteTimelineStep } from '@/services/timelineService';
import { toast } from 'sonner';
import { Settings, Plus } from 'lucide-react';
import MobileTimeline from './timeline/MobileTimeline';
import DesktopTimeline from './timeline/DesktopTimeline';
import TimelineEditDialog from './timeline/TimelineEditDialog';
import TimelineSkeleton from './timeline/TimelineSkeleton';
import { useAuth } from '@/contexts/AuthContext';

interface KpTimelineProps {
  readOnly?: boolean;
}

const KpTimeline = ({ readOnly = false }: KpTimelineProps) => {
  const [steps, setSteps] = useState<TimelineStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState<TimelineStep | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isMobile = useIsMobile();
  const { profile } = useAuth();

  // Check if user can manage timeline (coordinator, admin, supervisor)
  const canManageTimeline = profile?.role && ['coordinator', 'admin', 'supervisor'].includes(profile.role);

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

  const handleAddNew = () => {
    setCurrentStep({
      id: '',
      title: '',
      period: '',
      description: ''
    });
    setOpenDialog(true);
  };

  const handleSaveStep = async (step: TimelineStep) => {
    setIsSubmitting(true);
    try {
      const updatedStep = await updateTimelineStep(step);
      if (updatedStep) {
        // Refresh the entire list to ensure consistency
        await loadTimelineSteps();
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

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus timeline ini?')) {
      return;
    }

    try {
      const success = await deleteTimelineStep(stepId);
      if (success) {
        await loadTimelineSteps();
        toast.success("Timeline step deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete timeline step:", error);
      toast.error("Failed to delete timeline step");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Timeline Kerja Praktik</CardTitle>
        {!readOnly && canManageTimeline && (
          <div className="flex gap-2">
            <Button onClick={handleAddNew} size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <TimelineSkeleton isMobile={isMobile} />
        ) : (
          isMobile ? (
            <MobileTimeline 
              steps={steps} 
              onEditStep={!readOnly && canManageTimeline ? handleEditClick : undefined}
              onDeleteStep={!readOnly && canManageTimeline ? handleDeleteStep : undefined}
              readOnly={readOnly || !canManageTimeline}
            />
          ) : (
            <DesktopTimeline 
              steps={steps} 
              onEditStep={!readOnly && canManageTimeline ? handleEditClick : undefined}
              onDeleteStep={!readOnly && canManageTimeline ? handleDeleteStep : undefined}
              readOnly={readOnly || !canManageTimeline}
            />
          )
        )}
      </CardContent>

      {!readOnly && canManageTimeline && (
        <TimelineEditDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          currentStep={currentStep}
          onSave={handleSaveStep}
          isSubmitting={isSubmitting}
        />
      )}
    </Card>
  );
};

export default KpTimeline;
