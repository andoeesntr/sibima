
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { createGuidanceSession } from '@/services/guidanceService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

const formSchema = z.object({
  student_id: z.string().min(1, 'Mahasiswa harus dipilih'),
  supervisor_id: z.string().min(1, 'Dosen pembimbing harus dipilih'),
  session_date: z.date({
    required_error: 'Tanggal bimbingan harus diisi',
  }),
  session_type: z.string().min(1, 'Tipe bimbingan harus dipilih'),
});

type Student = {
  id: string;
  full_name: string;
  nim?: string;
};

type Supervisor = {
  id: string;
  full_name: string;
};

const ScheduleGuidanceForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      session_type: 'regular',
    },
  });

  useEffect(() => {
    const fetchStudentsAndSupervisors = async () => {
      try {
        // Fetch students
        const { data: studentData, error: studentError } = await supabase
          .from('profiles')
          .select('id, full_name, nim')
          .eq('role', 'student');

        if (studentError) throw studentError;
        setStudents(studentData || []);

        // Fetch supervisors
        const { data: supervisorData, error: supervisorError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'supervisor');

        if (supervisorError) throw supervisorError;
        setSupervisors(supervisorData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load students and supervisors');
      }
    };

    fetchStudentsAndSupervisors();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Convert date to ISO string for database
      const sessionToCreate = {
        ...values,
        session_date: values.session_date.toISOString(),
        status: 'scheduled' as const,
      };
      
      const result = await createGuidanceSession(sessionToCreate);
      
      if (result) {
        form.reset();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="student_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mahasiswa</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mahasiswa" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} {student.nim ? `(${student.nim})` : ''}
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
          name="supervisor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dosen Pembimbing</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih dosen pembimbing" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {supervisors.map((supervisor) => (
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
          name="session_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal Bimbingan</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className="w-full pl-3 text-left font-normal"
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="session_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Bimbingan</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe bimbingan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="regular">Bimbingan Reguler</SelectItem>
                  <SelectItem value="scheduled">Bimbingan Terjadwal</SelectItem>
                  <SelectItem value="final">Bimbingan Final</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Bimbingan Terjadwal adalah bimbingan wajib sesuai timeline KP.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Menjadwalkan...' : 'Jadwalkan Bimbingan'}
        </Button>
      </form>
    </Form>
  );
};

export default ScheduleGuidanceForm;
