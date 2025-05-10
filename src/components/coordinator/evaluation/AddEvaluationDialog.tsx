
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createEvaluation, Evaluation } from '@/services/evaluationService';

interface AddEvaluationDialogProps {
  open: boolean;
  onClose: () => void;
  onEvaluationAdded: () => void;
  evaluation: Evaluation | null;
  existingStudentIds: string[];
}

const formSchema = z.object({
  student_id: z.string({
    required_error: "Silakan pilih mahasiswa",
  }),
  evaluator_id: z.string({
    required_error: "Silakan pilih pembimbing",
  }),
  evaluator_type: z.enum(['supervisor', 'field_supervisor'], {
    required_error: "Silakan pilih tipe pembimbing",
  }),
  score: z.coerce.number()
    .min(0, { message: "Nilai minimal 0" })
    .max(100, { message: "Nilai maksimal 100" }),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddEvaluationDialog = ({
  open,
  onClose,
  onEvaluationAdded,
  evaluation,
  existingStudentIds,
}: AddEvaluationDialogProps) => {
  const [students, setStudents] = useState<{ id: string; full_name: string; nim: string }[]>([]);
  const [supervisors, setSupervisors] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_id: '',
      evaluator_id: '',
      evaluator_type: 'supervisor',
      score: 0,
      comments: '',
    },
  });
  
  useEffect(() => {
    if (open) {
      loadUsers();
      
      if (evaluation) {
        form.reset({
          student_id: evaluation.student_id,
          evaluator_id: evaluation.evaluator_id,
          evaluator_type: evaluation.evaluator_type,
          score: evaluation.score,
          comments: evaluation.comments || '',
        });
      } else {
        form.reset({
          student_id: '',
          evaluator_id: '',
          evaluator_type: 'supervisor',
          score: 0,
          comments: '',
        });
      }
    }
  }, [open, evaluation]);
  
  const loadUsers = async () => {
    setLoading(true);
    
    try {
      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name, nim')
        .eq('role', 'student')
        .order('full_name');
        
      if (studentsError) throw studentsError;
      
      // Load supervisors
      const { data: supervisorsData, error: supervisorsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('role', ['supervisor'])
        .order('full_name');
        
      if (supervisorsError) throw supervisorsError;
      
      setStudents(studentsData || []);
      setSupervisors(supervisorsData || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error(`Failed to load users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    
    try {
      let evaluationData: Omit<Evaluation, 'id' | 'created_at'> = {
        student_id: data.student_id,
        evaluator_id: data.evaluator_id,
        evaluator_type: data.evaluator_type,
        score: data.score,
        comments: data.comments || null,
        evaluation_date: new Date().toISOString(),
        document_url: null,
      };
      
      if (evaluation) {
        // Update existing evaluation
        const { error } = await supabase
          .from('evaluations')
          .update({
            evaluator_id: data.evaluator_id,
            score: data.score,
            comments: data.comments || null,
            evaluation_date: new Date().toISOString(),
          })
          .eq('id', evaluation.id);
          
        if (error) throw error;
        
        toast.success('Penilaian berhasil diperbarui');
      } else {
        // Check if student already has an evaluation of this type
        const { data: existingData, error: checkError } = await supabase
          .from('evaluations')
          .select('id')
          .eq('student_id', data.student_id)
          .eq('evaluator_type', data.evaluator_type)
          .limit(1);
          
        if (checkError) throw checkError;
        
        if (existingData && existingData.length > 0) {
          throw new Error(`Mahasiswa ini sudah memiliki penilaian ${data.evaluator_type === 'supervisor' ? 'pembimbing akademik' : 'pembimbing lapangan'}`);
        }
        
        // Create new evaluation
        await createEvaluation(evaluationData);
        toast.success('Penilaian berhasil ditambahkan');
      }
      
      onEvaluationAdded();
    } catch (error: any) {
      console.error('Error saving evaluation:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Check if student already has both types of evaluations
  const isStudentFullyEvaluated = (studentId: string) => {
    return existingStudentIds.includes(studentId);
  };
  
  // Filter available students based on existing evaluations when creating a new evaluation
  const getAvailableStudents = () => {
    if (evaluation) {
      // If editing, don't filter
      return students;
    }
    
    const selectedType = form.watch('evaluator_type');
    
    // Check which students already have the current evaluator type
    return students.filter(student => {
      // Check if this student already has an evaluation of the selected type
      const hasEvaluation = students.some(s => 
        s.id === student.id && 
        isStudentFullyEvaluated(student.id)
      );
      
      return !hasEvaluation;
    });
  };
  
  const dialogTitle = evaluation ? 'Edit Penilaian' : 'Tambah Penilaian';
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {evaluation 
              ? 'Edit nilai dan komentar untuk mahasiswa ini.' 
              : 'Tambahkan penilaian baru untuk mahasiswa KP.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mahasiswa</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loading || !!evaluation}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih mahasiswa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getAvailableStudents().map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} - {student.nim}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="evaluator_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Pembimbing</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loading || !!evaluation}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe pembimbing" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="supervisor">Pembimbing Akademik</SelectItem>
                      <SelectItem value="field_supervisor">Pembimbing Lapangan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="evaluator_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pembimbing</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pembimbing" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supervisors.map(supervisor => (
                        <SelectItem key={supervisor.id} value={supervisor.id}>
                          {supervisor.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nilai</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Masukkan nilai (0-100)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Komentar (opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan komentar tambahan jika ada"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : evaluation ? 'Perbarui' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEvaluationDialog;
