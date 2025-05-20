
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Evaluation } from '@/services/evaluationService';
import { useEvaluationData } from './hooks/useEvaluationData';
import StudentInfo from './components/StudentInfo';
import EvaluationTabs from './components/EvaluationTabs';
import DialogFooter from './components/DialogFooter';

interface EditEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluation: Evaluation;
  onSave: (evaluation: Evaluation) => void;
}

const EditEvaluationDialog = ({
  open,
  onOpenChange,
  evaluation,
  onSave
}: EditEvaluationDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>('supervisor');
  
  const {
    supervisorScore,
    setSupervisorScore,
    fieldSupervisorScore,
    setFieldSupervisorScore,
    supervisorComments,
    setSupervisorComments,
    fieldSupervisorComments,
    setFieldSupervisorComments,
    isSubmitting,
    handleScoreUpdate
  } = useEvaluationData({ evaluation, open });

  const handleSubmit = async () => {
    // Always save the current active tab's evaluation
    const isActiveSupervisor = activeTab === 'supervisor';
    const score = isActiveSupervisor ? supervisorScore : fieldSupervisorScore;
    const comments = isActiveSupervisor ? supervisorComments : fieldSupervisorComments;
    
    await handleScoreUpdate(
      activeTab,
      score,
      comments,
      onSave,
      () => onOpenChange(false)
    );
  };

  const isSubmitDisabled = 
    (activeTab === 'supervisor' && !supervisorScore) || 
    (activeTab === 'field_supervisor' && !fieldSupervisorScore);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Nilai</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <StudentInfo evaluation={evaluation} />
          
          <EvaluationTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            supervisorScore={supervisorScore}
            onSupervisorScoreChange={setSupervisorScore}
            fieldSupervisorScore={fieldSupervisorScore}
            onFieldSupervisorScoreChange={setFieldSupervisorScore}
            supervisorComments={supervisorComments}
            onSupervisorCommentsChange={setSupervisorComments}
            fieldSupervisorComments={fieldSupervisorComments}
            onFieldSupervisorCommentsChange={setFieldSupervisorComments}
            isSubmitting={isSubmitting}
          />
          
          <DialogFooter
            onCancel={() => onOpenChange(false)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isDisabled={isSubmitDisabled}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEvaluationDialog;
