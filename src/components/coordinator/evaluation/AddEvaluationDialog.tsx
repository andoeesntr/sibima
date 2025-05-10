
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Evaluation, createEvaluation } from '@/services/evaluationService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvaluation: (evaluation: Evaluation) => void;
  existingEvaluations: Evaluation[];
}

interface Student {
  id: string;
  full_name: string;
}

const AddEvaluationDialog = ({
  open,
  onOpenChange,
  onAddEvaluation,
  existingEvaluations
}: AddEvaluationDialogProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [studentId, setStudentId] = useState<string>('');
  const [academicScore, setAcademicScore] = useState<string>('');
  const [fieldScore, setFieldScore] = useState<string>('');
  const [finalScore, setFinalScore] = useState<string>('');
  
  // Load students that have participated in KP
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        // Get students with role 'student'
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'student');
        
        if (error) throw error;
        setStudents(data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      fetchStudents();
      resetForm();
    }
  }, [open]);
  
  const resetForm = () => {
    setStudentId('');
    setAcademicScore('');
    setFieldScore('');
    setFinalScore('');
  };
  
  // Calculate final score when academic and field scores change
  useEffect(() => {
    if (academicScore && fieldScore) {
      const academic = parseFloat(academicScore);
      const field = parseFloat(fieldScore);
      
      if (!isNaN(academic) && !isNaN(field)) {
        // Calculate final score (60% academic + 40% field)
        const calculatedFinal = (academic * 0.6) + (field * 0.4);
        setFinalScore(calculatedFinal.toFixed(2));
      }
    } else {
      setFinalScore('');
    }
  }, [academicScore, fieldScore]);
  
  // Check if a student already has an evaluation
  const isStudentEvaluated = (id: string) => {
    // Group evaluations by student_id and evaluator_type to check if both academic and field evaluations exist
    const evaluationsByStudent: Record<string, Set<string>> = {};
    
    existingEvaluations.forEach(evaluation => {
      if (!evaluationsByStudent[evaluation.student_id]) {
        evaluationsByStudent[evaluation.student_id] = new Set();
      }
      evaluationsByStudent[evaluation.student_id].add(evaluation.evaluator_type);
    });
    
    // Return true if the student already has both types of evaluations
    return evaluationsByStudent[id] && 
           evaluationsByStudent[id].has('supervisor') && 
           evaluationsByStudent[id].has('field_supervisor');
  };
  
  // Filter out students who already have complete evaluations
  const availableStudents = students.filter(student => !isStudentEvaluated(student.id));
  
  const handleSubmit = async () => {
    if (!studentId || !academicScore || !fieldScore) {
      toast.error('Semua field harus diisi');
      return;
    }
    
    const academic = parseFloat(academicScore);
    const field = parseFloat(fieldScore);
    
    if (isNaN(academic) || isNaN(field) || academic < 0 || academic > 100 || field < 0 || field > 100) {
      toast.error('Nilai harus berupa angka antara 0-100');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Get current user (coordinator) for evaluator_id
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Create academic supervisor evaluation
      const academicEvaluation = await createEvaluation({
        student_id: studentId,
        evaluator_id: user.id,
        evaluator_type: 'supervisor',
        score: academic,
        comments: 'Penilaian oleh pembimbing akademik',
        document_url: null  // Add this line to fix TypeScript error
      });
      
      // Create field supervisor evaluation
      const fieldEvaluation = await createEvaluation({
        student_id: studentId,
        evaluator_id: user.id,
        evaluator_type: 'field_supervisor',
        score: field,
        comments: 'Penilaian oleh pembimbing lapangan',
        document_url: null  // Add this line to fix TypeScript error
      });
      
      if (academicEvaluation && fieldEvaluation) {
        onAddEvaluation(academicEvaluation);
        onAddEvaluation(fieldEvaluation);
        resetForm();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error adding evaluation:', error);
      toast.error('Failed to save evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Nilai KP</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="student">Mahasiswa</Label>
            <Select 
              value={studentId} 
              onValueChange={setStudentId}
              disabled={loading || availableStudents.length === 0}
            >
              <SelectTrigger id="student">
                <SelectValue placeholder="Pilih mahasiswa" />
              </SelectTrigger>
              <SelectContent>
                {availableStudents.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name}
                  </SelectItem>
                ))}
                {availableStudents.length === 0 && (
                  <SelectItem value="none" disabled>
                    Tidak ada mahasiswa tersedia
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="academicScore">Nilai Pembimbing Akademik (0-100)</Label>
            <Input
              id="academicScore"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={academicScore}
              onChange={(e) => setAcademicScore(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fieldScore">Nilai Pembimbing Lapangan (0-100)</Label>
            <Input
              id="fieldScore"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={fieldScore}
              onChange={(e) => setFieldScore(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="finalScore">Nilai Akhir (60% Akademik + 40% Lapangan)</Label>
            <Input
              id="finalScore"
              type="text"
              value={finalScore}
              disabled
              className="bg-gray-50"
            />
          </div>
          
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
              disabled={isSubmitting || !studentId || !academicScore || !fieldScore}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEvaluationDialog;
