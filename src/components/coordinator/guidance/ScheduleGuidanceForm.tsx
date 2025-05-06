
import { useState } from 'react';
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
import { CalendarIcon } from 'lucide-react';
import { createGuidanceSession } from '@/services/guidanceService';

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
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      session_type: "proposal-review",
    },
  });

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
                  <SelectItem value="student1">Budi Santoso (12345678)</SelectItem>
                  <SelectItem value="student2">Siti Rahma (87654321)</SelectItem>
                  <SelectItem value="student3">Dian Anggoro (23456789)</SelectItem>
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
                  <SelectItem value="supervisor1">Dr. Ahmad Wijaya</SelectItem>
                  <SelectItem value="supervisor2">Dr. Kartika Dewi</SelectItem>
                  <SelectItem value="supervisor3">Prof. Bambang Sutejo</SelectItem>
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
