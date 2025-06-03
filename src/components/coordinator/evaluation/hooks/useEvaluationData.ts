
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Evaluation } from '@/services/evaluationService';
import { toast } from 'sonner';

interface UseEvaluationDataProps {
  evaluation: Evaluation;
  open: boolean;
}

export const useEvaluationData = ({ evaluation, open }: UseEvaluationDataProps) => {
  const [supervisorScore, setSupervisorScore] = useState<string>('');
  const [fieldSupervisorScore, setFieldSupervisorScore] = useState<string>('');
  const [supervisorComments, setSupervisorComments] = useState<string>('');
  const [fieldSupervisorComments, setFieldSupervisorComments] = useState<string>('');
  const [studentEvaluations, setStudentEvaluations] = useState<Evaluation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      // Set values for both supervisor types regardless of the active tab
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
    } catch (error) {
      console.error('Error fetching student evaluations:', error);
      toast.error('Gagal memuat data penilaian mahasiswa');
    }
  };

  const handleScoreUpdate = async (
    activeTab: string, 
    score: string, 
    comments: string, 
    onSave: (evaluation: Evaluation) => void, 
    onClose: () => void
  ) => {
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
      
      // Update the local state for the modified evaluation
      const updatedEvaluations = studentEvaluations.map(e => {
        if (e.id === currentEvaluation.id) {
          return {
            ...e,
            score: numScore,
            comments: comments
          };
        }
        return e;
      });
      
      setStudentEvaluations(updatedEvaluations);
      
      // Only update the specific evaluation that was modified
      onSave({
        ...currentEvaluation,
        score: numScore,
        comments: comments
      });
      
      onClose();
      toast.success('Penilaian berhasil diperbarui');
    } catch (error) {
      console.error('Error updating evaluation:', error);
      toast.error('Gagal memperbarui penilaian');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    supervisorScore,
    setSupervisorScore,
    fieldSupervisorScore,
    setFieldSupervisorScore,
    supervisorComments,
    setSupervisorComments,
    fieldSupervisorComments,
    setFieldSupervisorComments,
    studentEvaluations,
    isSubmitting,
    handleScoreUpdate
  };
};
