
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useStudentDashboard } from '@/hooks/useStudentDashboard';

const formSchema = z.object({
  date: z.date({
    required_error: "Tanggal bimbingan harus dipilih",
  }),
  time: z.string().min(1, "Waktu harus dipilih"),
  duration: z.string().min(1, "Durasi harus dipilih"),
  topic: z.string().min(5, "Topik bimbingan minimal 5 karakter"),
  description: z.string().optional(),
  location_type: z.string().min(1, "Jenis lokasi harus dipilih"),
  location: z.string().optional(),
});

const GuidanceRequestForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { selectedProposal } = useStudentDashboard();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      description: '',
      location_type: '',
      location: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedProposal || !selectedProposal.supervisors || selectedProposal.supervisors.length === 0) {
      toast.error('Tidak ada dosen pembimbing yang tersedia');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Combine date and time
      const requestedDateTime = new Date(values.date);
      const [hours, minutes] = values.time.split(':');
      requestedDateTime.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase
        .from('kp_guidance_schedule')
        .insert({
          student_id: user?.id,
          supervisor_id: selectedProposal.supervisors[0].id,
          requested_date: requestedDateTime.toISOString(),
          topic: values.topic,
          duration_minutes: parseInt(values.duration),
          location: values.location_type === 'online' ? 'Online' : values.location,
          meeting_link: values.location_type === 'online' ? 'Akan diberikan oleh dosen' : null,
          status: 'requested'
        });

      if (error) throw error;

      toast.success('Permintaan bimbingan berhasil diajukan');
      form.reset();
    } catch (error) {
      console.error('Error submitting guidance request:', error);
      toast.error('Gagal mengajukan permintaan bimbingan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00'
  ];

  const durationOptions = [
    { value: '60', label: '1 jam' },
    { value: '90', label: '1.5 jam' },
    { value: '120', label: '2 jam' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajukan Sesi Bimbingan</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Bimbingan</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: id })
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
                          disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
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
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu Bimbingan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih waktu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durasi Bimbingan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih durasi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topik Bimbingan</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan topik yang akan dibahas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi/Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tambahkan deskripsi atau catatan tambahan"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_type"
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
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('location_type') === 'offline' && (
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi Bimbingan</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan lokasi bimbingan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Mengajukan...' : 'Ajukan Bimbingan'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GuidanceRequestForm;
