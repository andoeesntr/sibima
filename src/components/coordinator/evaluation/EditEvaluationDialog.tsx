
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Evaluation } from '@/services/evaluationService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const [supervisorScore, setSupervisorScore] = useState<string>('');
  const [fieldSupervisorScore, setFieldSupervisorScore] = useState<string>('');
  const [supervisorComments, setSupervisorComments] = useState<string>('');
  const [fieldSupervisorComments, setFieldSupervisorComments] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('supervisor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentEvaluations, setStudentEvaluations] = useState<Evaluation[]>([]);
  
  // Fetch all evaluations for this student when the dialog opens
  useEffect(() => {
    if (open && evaluation) {
      fetchStudentEvaluations(evaluation.student_id);
    }
  }, [open, evaluation]);
  
  const fetchStudentEvaluations = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .eq('student_id', studentId);
        
      if (error) throw error;
      
      if (!data) return;
      
      // Transform the data to ensure evaluator_type is strictly 'supervisor' or 'field_supervisor'
      const transformedData = data.map(item => {
        // Validate that evaluator_type is one of the expected values
        let evaluatorType: 'supervisor' | 'field_supervisor' = 'supervisor';
        if (item.evaluator_type === 'field_supervisor') {
          evaluatorType = 'field_supervisor';
        }
        
        return {
          ...item,
          evaluator_type: evaluatorType,
          student: evaluation.student, // Preserve student data from the original evaluation
          evaluator: evaluation.evaluator // Preserve evaluator data from the original evaluation
        } as Evaluation;
      });
      
      setStudentEvaluations(transformedData);
      
      // Set values for both supervisor types
      const supervisorEval = transformedData.find(e => e.evaluator_type === 'supervisor');
      const fieldSupervisorEval = transformedData.find(e => e.evaluator_type === 'field_supervisor');
      
      if (supervisorEval) {
        setSupervisorScore(supervisorEval.score.toString());
        setSupervisorComments(supervisorEval.comments || '');
      }
      
      if (fieldSupervisorEval) {
        setFieldSupervisorScore(fieldSupervisorEval.score.toString());
        setFieldSupervisorComments(fieldSupervisorEval.comments || '');
      }
      
      // Set active tab based on current evaluation
      setActiveTab(evaluation.evaluator_type);
    } catch (error) {
      console.error('Error fetching student evaluations:', error);
      toast.error('Gagal memuat data penilaian mahasiswa');
    }
  };
  
  const handleSubmit = async () => {
    const isActiveSupervisor = activeTab === 'supervisor';
    const score = isActiveSupervisor ? supervisorScore : fieldSupervisorScore;
    const comments = isActiveSupervisor ? supervisorComments : fieldSupervisorComments;
    
    if (!score) {
      toast.error('Nilai harus diisi');
      return;
    }
    
    const numScore = parseFloat(score);
    
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      toast.error('Nilai harus berupa angka antara 0-100');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Find the correct evaluation ID based on the active tab
      const currentEvaluation = studentEvaluations.find(e => e.evaluator_type === activeTab);
      
      if (!currentEvaluation) {
        toast.error('Data penilaian tidak ditemukan');
        setIsSubmitting(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('evaluations')
        .update({
          score: numScore,
          comments: comments
        })
        .eq('id', currentEvaluation.id)
        .select()
        .single();
      
      if (error) throw error;
      
      onSave({
        ...currentEvaluation,
        score: numScore,
        comments: comments
      });
      
      onOpenChange(false);
      toast.success('Penilaian berhasil diperbarui');
    } catch (error) {
      console.error('Error updating evaluation:', error);
      toast.error('Gagal memperbarui penilaian');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Nilai</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label className="font-bold">Mahasiswa</Label>
            <p className="text-gray-700 mt-1">{evaluation?.student?.full_name}</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="supervisor">Pembimbing Akademik</TabsTrigger>
              <TabsTrigger value="field_supervisor">Pembimbing Lapangan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="supervisor" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="supervisorScore">Nilai Pembimbing Akademik (0-100)</Label>
                <Input
                  id="supervisorScore"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={supervisorScore}
                  onChange={(e) => setSupervisorScore(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supervisorComments">Catatan</Label>
                <Textarea
                  id="supervisorComments"
                  value={supervisorComments}
                  onChange={(e) => setSupervisorComments(e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="field_supervisor" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="fieldSupervisorScore">Nilai Pembimbing Lapangan (0-100)</Label>
                <Input
                  id="fieldSupervisorScore"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={fieldSupervisorScore}
                  onChange={(e) => setFieldSupervisorScore(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fieldSupervisorComments">Catatan</Label>
                <Textarea
                  id="fieldSupervisorComments"
                  value={fieldSupervisorComments}
                  onChange={(e) => setFieldSupervisorComments(e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || 
                (activeTab === 'supervisor' && !supervisorScore) || 
                (activeTab === 'field_supervisor' && !fieldSupervisorScore)}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEvaluationDialog;
