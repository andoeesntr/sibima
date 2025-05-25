
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createEvaluation, Evaluation } from '@/services/evaluationService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Student {
  id: string;
  full_name: string;
  nim: string;
}

interface AddEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvaluation: (evaluation: Evaluation) => void;
  existingEvaluations: Evaluation[];
}

const AddEvaluationDialog = ({
  open,
  onOpenChange,
  onAddEvaluation,
  existingEvaluations
}: AddEvaluationDialogProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [supervisorScore, setSupervisorScore] = useState<string>('');
  const [fieldSupervisorScore, setFieldSupervisorScore] = useState<string>('');
  const [supervisorComments, setSupervisorComments] = useState<string>('');
  const [fieldSupervisorComments, setFieldSupervisorComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, nim')
        .eq('role', 'student')
        .order('full_name');
        
      if (error) throw error;
      
      // Filter out students who already have evaluations
      const studentsWithEvaluations = new Set(
        existingEvaluations.map(evaluation => evaluation.student_id)
      );
      
      const availableStudents = (data || []).filter(
        student => !studentsWithEvaluations.has(student.id)
      );
      
      setStudents(availableStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Gagal memuat data mahasiswa');
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudent) {
      toast.error('Pilih mahasiswa terlebih dahulu');
      return;
    }
    
    if (!supervisorScore || !fieldSupervisorScore) {
      toast.error('Kedua nilai harus diisi');
      return;
    }
    
    const supScore = parseFloat(supervisorScore);
    const fieldScore = parseFloat(fieldSupervisorScore);
    
    if (isNaN(supScore) || isNaN(fieldScore) || supScore < 0 || supScore > 100 || fieldScore < 0 || fieldScore > 100) {
      toast.error('Nilai harus berupa angka antara 0-100');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Get current user ID for evaluator_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Create supervisor evaluation
      const supervisorEvaluation = await createEvaluation({
        student_id: selectedStudent,
        evaluator_id: user.id,
        evaluator_type: 'supervisor',
        score: supScore,
        comments: supervisorComments
      });
      
      // Create field supervisor evaluation
      const fieldSupervisorEvaluation = await createEvaluation({
        student_id: selectedStudent,
        evaluator_id: user.id,
        evaluator_type: 'field_supervisor',
        score: fieldScore,
        comments: fieldSupervisorComments
      });
      
      // Add both evaluations to the list
      onAddEvaluation(supervisorEvaluation);
      onAddEvaluation(fieldSupervisorEvaluation);
      
      // Reset form
      setSelectedStudent('');
      setSupervisorScore('');
      setFieldSupervisorScore('');
      setSupervisorComments('');
      setFieldSupervisorComments('');
      
      onOpenChange(false);
      toast.success('Penilaian berhasil ditambahkan');
    } catch (error) {
      console.error('Error adding evaluation:', error);
      toast.error('Gagal menambahkan penilaian');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Nilai Mahasiswa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="student">Mahasiswa</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih mahasiswa" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name} - {student.nim}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supervisor-score">Nilai Pembimbing Akademik (0-100)</Label>
            <Input
              id="supervisor-score"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={supervisorScore}
              onChange={(e) => setSupervisorScore(e.target.value)}
              placeholder="Masukkan nilai"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supervisor-comments">Komentar Pembimbing Akademik</Label>
            <Textarea
              id="supervisor-comments"
              value={supervisorComments}
              onChange={(e) => setSupervisorComments(e.target.value)}
              placeholder="Komentar untuk penilaian..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="field-supervisor-score">Nilai Pembimbing Lapangan (0-100)</Label>
            <Input
              id="field-supervisor-score"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={fieldSupervisorScore}
              onChange={(e) => setFieldSupervisorScore(e.target.value)}
              placeholder="Masukkan nilai"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="field-supervisor-comments">Komentar Pembimbing Lapangan</Label>
            <Textarea
              id="field-supervisor-comments"
              value={fieldSupervisorComments}
              onChange={(e) => setFieldSupervisorComments(e.target.value)}
              placeholder="Komentar untuk penilaian..."
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEvaluationDialog;
