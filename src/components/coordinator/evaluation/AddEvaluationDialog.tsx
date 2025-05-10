
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  createEvaluation, 
  updateEvaluation, 
  Evaluation 
} from '@/services/evaluationService';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

interface Student {
  id: string;
  full_name: string;
  nim: string;
}

interface AddEvaluationDialogProps {
  open: boolean;
  onClose: () => void;
  onEvaluationAdded: () => void;
  evaluation: Evaluation | null;
  existingStudentIds: string[];
}

const AddEvaluationDialog = ({
  open,
  onClose,
  onEvaluationAdded,
  evaluation,
  existingStudentIds
}: AddEvaluationDialogProps) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('academic');
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    academicScore: '',
    fieldScore: '',
    comments: '',
  });
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

  // Get available students for dropdown
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, nim')
          .eq('role', 'student');
          
        if (error) throw error;
        
        setStudents(data as Student[]);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      fetchStudents();
    }
  }, [open]);

  // Filter available students (those without evaluations already)
  useEffect(() => {
    if (evaluation) {
      // In edit mode, don't filter out the current student
      const filtered = students;
      setAvailableStudents(filtered);
      setFormData({
        studentId: evaluation.student_id,
        academicScore: evaluation.evaluator_type === 'supervisor' ? String(evaluation.score) : '',
        fieldScore: evaluation.evaluator_type === 'field_supervisor' ? String(evaluation.score) : '',
        comments: evaluation.comments || '',
      });
      setActiveTab(evaluation.evaluator_type === 'supervisor' ? 'academic' : 'field');
    } else {
      // In add mode, filter out students who already have evaluations
      const filtered = students.filter(student => 
        !existingStudentIds.includes(student.id)
      );
      setAvailableStudents(filtered);
    }
  }, [students, evaluation, existingStudentIds]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        studentId: '',
        academicScore: '',
        fieldScore: '',
        comments: '',
      });
      setActiveTab('academic');
    }
  }, [open]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateScore = (score: string): boolean => {
    const numScore = parseFloat(score);
    return !isNaN(numScore) && numScore >= 0 && numScore <= 100;
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.studentId) {
      toast.error('Pilih mahasiswa terlebih dahulu');
      return;
    }

    if (activeTab === 'academic' && (!formData.academicScore || !validateScore(formData.academicScore))) {
      toast.error('Masukkan nilai pembimbing akademik yang valid (0-100)');
      return;
    }

    if (activeTab === 'field' && (!formData.fieldScore || !validateScore(formData.fieldScore))) {
      toast.error('Masukkan nilai pembimbing lapangan yang valid (0-100)');
      return;
    }

    setSubmitting(true);

    try {
      const evaluatorId = profile?.id || '';
      
      if (evaluation) {
        // Update existing evaluation
        const updatedEvaluation = {
          id: evaluation.id,
          score: activeTab === 'academic' 
            ? parseFloat(formData.academicScore) 
            : parseFloat(formData.fieldScore),
          comments: formData.comments,
          document_url: evaluation.document_url,
        };
        
        await updateEvaluation(updatedEvaluation);
        toast.success('Penilaian berhasil diperbarui');
      } else {
        // Create new evaluation
        if (activeTab === 'academic') {
          await createEvaluation({
            student_id: formData.studentId,
            evaluator_id: evaluatorId,
            evaluator_type: 'supervisor',
            score: parseFloat(formData.academicScore),
            comments: formData.comments,
            document_url: null,
          });
          toast.success('Nilai pembimbing akademik berhasil ditambahkan');
        } else {
          await createEvaluation({
            student_id: formData.studentId,
            evaluator_id: evaluatorId,
            evaluator_type: 'field_supervisor',
            score: parseFloat(formData.fieldScore),
            comments: formData.comments,
            document_url: null,
          });
          toast.success('Nilai pembimbing lapangan berhasil ditambahkan');
        }
      }
      
      onEvaluationAdded();
    } catch (error) {
      console.error('Error saving evaluation:', error);
      toast.error('Gagal menyimpan penilaian');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => !submitting && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {evaluation ? 'Edit Penilaian' : 'Tambah Penilaian Baru'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="student">Mahasiswa</Label>
            <Select
              disabled={!!evaluation || submitting}
              value={formData.studentId}
              onValueChange={handleSelectChange('studentId')}
            >
              <SelectTrigger id="student">
                <SelectValue placeholder="Pilih mahasiswa" />
              </SelectTrigger>
              <SelectContent>
                {availableStudents.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    {loading ? 'Loading...' : 'Tidak ada mahasiswa tersedia'}
                  </SelectItem>
                ) : (
                  availableStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.nim} - {student.full_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="academic" className="flex-1">
                Pembimbing Akademik
              </TabsTrigger>
              <TabsTrigger value="field" className="flex-1">
                Pembimbing Lapangan
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="academic" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="academicScore">Nilai (0-100)</Label>
                <Input
                  id="academicScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.academicScore}
                  onChange={handleInputChange('academicScore')}
                  disabled={submitting}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="field" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="fieldScore">Nilai (0-100)</Label>
                <Input
                  id="fieldScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.fieldScore}
                  onChange={handleInputChange('fieldScore')}
                  disabled={submitting}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-2">
            <Label htmlFor="comments">Komentar</Label>
            <Textarea
              id="comments"
              rows={3}
              value={formData.comments}
              onChange={handleInputChange('comments')}
              disabled={submitting}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Menyimpan...' : evaluation ? 'Perbarui' : 'Simpan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEvaluationDialog;
