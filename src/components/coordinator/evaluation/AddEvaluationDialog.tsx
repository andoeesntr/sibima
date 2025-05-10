
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

const formSchema = z.object({
  studentId: z.string({
    required_error: "Pilih mahasiswa terlebih dahulu",
  }),
  score: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 100;
  }, { message: "Nilai harus antara 0-100" }),
  comments: z.string().optional(),
});

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
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      score: "",
      comments: "",
    },
  });

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

  // Filter available students based on editing state
  useEffect(() => {
    if (evaluation) {
      // In edit mode, show all students but disable selection
      setAvailableStudents(students);
      form.setValue("studentId", evaluation.student_id);
      form.setValue("score", evaluation.evaluator_type === 'supervisor' ? 
        String(evaluation.score) : (evaluation.evaluator_type === 'field_supervisor' ? 
        String(evaluation.score) : ""));
      form.setValue("comments", evaluation.comments || "");
      setActiveTab(evaluation.evaluator_type === 'supervisor' ? 'academic' : 'field');
    } else {
      // Filter out students with existing evaluations only in add mode
      const filtered = students.filter(student => 
        !existingStudentIds.includes(student.id)
      );
      setAvailableStudents(filtered);
      
      // Reset form data in add mode
      form.reset({
        studentId: "",
        score: "",
        comments: "",
      });
    }
  }, [students, evaluation, existingStudentIds, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);

    try {
      const evaluatorId = profile?.id || '';
      
      if (evaluation) {
        // Update existing evaluation
        const updatedEvaluation = {
          id: evaluation.id,
          score: parseFloat(values.score),
          comments: values.comments || null,
          document_url: evaluation.document_url,
        };
        
        await updateEvaluation(updatedEvaluation);
        toast.success('Penilaian berhasil diperbarui');
      } else {
        // Create new evaluation
        if (activeTab === 'academic') {
          await createEvaluation({
            student_id: values.studentId,
            evaluator_id: evaluatorId,
            evaluator_type: 'supervisor',
            score: parseFloat(values.score),
            comments: values.comments || null,
            document_url: null,
            evaluation_date: new Date().toISOString(),
          });
          toast.success('Nilai pembimbing akademik berhasil ditambahkan');
        } else {
          await createEvaluation({
            student_id: values.studentId,
            evaluator_id: evaluatorId,
            evaluator_type: 'field_supervisor',
            score: parseFloat(values.score),
            comments: values.comments || null,
            document_url: null,
            evaluation_date: new Date().toISOString(),
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
    <Dialog open={open} onOpenChange={(isOpen) => !submitting && !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {evaluation ? 'Edit Penilaian' : 'Tambah Penilaian Baru'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mahasiswa</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!evaluation || submitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih mahasiswa" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="academic">
                  Pembimbing Akademik
                </TabsTrigger>
                <TabsTrigger value="field">
                  Pembimbing Lapangan
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="academic" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nilai (0-100)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Masukkan nilai"
                          disabled={submitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="field" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nilai (0-100)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Masukkan nilai"
                          disabled={submitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Komentar</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Tambahkan komentar (opsional)"
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={submitting}
                type="button"
              >
                Batal
              </Button>
              <Button
                disabled={submitting}
                type="submit"
              >
                {submitting ? 'Menyimpan...' : evaluation ? 'Perbarui' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEvaluationDialog;
