
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader } from 'lucide-react';
import { createGuidanceSession, fetchStudentsAndSupervisors } from '@/services/guidanceService';

interface ScheduleGuidanceFormProps {
  onSuccess: () => void;
}

const formSchema = z.object({
  student_id: z.string({
    required_error: "Pilih mahasiswa",
  }),
  supervisor_id: z.string({
    required_error: "Pilih dosen pembimbing",
  }),
  session_date: z.date({
    required_error: "Pilih tanggal dan waktu bimbingan",
  }),
  session_type: z.string({
    required_error: "Pilih jenis bimbingan",
  }),
});

const ScheduleGuidanceForm = ({ onSuccess }: ScheduleGuidanceFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      session_type: "proposal-review",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { students, supervisors } = await fetchStudentsAndSupervisors();
      setStudents(students);
      setSupervisors(supervisors);
      setLoading(false);
    };

    loadData();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Format the date to ISO string
      const formattedDate = values.session_date.toISOString();
      
      // Create the session
      const session = await createGuidanceSession({
        student_id: values.student_id,
        supervisor_id: values.supervisor_id,
        session_date: formattedDate,
        session_type: values.session_type,
        status: "scheduled"
      });
      
      if (session) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error scheduling guidance:", error);
      toast.error("Gagal menjadwalkan bimbingan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      {student.full_name} ({student.nim})
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
                      {supervisor.full_name} {supervisor.nip && `(${supervisor.nip})`}
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
              <FormLabel>Tanggal & Waktu</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
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
                    disabled={(date) => date < new Date()}
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
              <FormLabel>Jenis Bimbingan</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis bimbingan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="proposal-review">Review Proposal</SelectItem>
                  <SelectItem value="progress-update">Progress Update</SelectItem>
                  <SelectItem value="final-report">Laporan Akhir</SelectItem>
                  <SelectItem value="general-discussion">Diskusi Umum</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 flex justify-end space-x-2">
          <Button 
            variant="outline" 
            type="button"
            onClick={() => onSuccess()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Jadwalkan Bimbingan"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ScheduleGuidanceForm;
