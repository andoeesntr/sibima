
import { supabase } from '@/integrations/supabase/client';

export interface TimesheetEntry {
  id: string;
  student_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  status: 'HADIR' | 'SAKIT' | 'IZIN' | 'LIBUR';
  notes: string | null;
  created_at: string;
  updated_at: string;
  student?: {
    full_name: string;
    nim: string;
  };
}

export const timesheetService = {
  async getStudentTimesheet(studentId: string, startDate: string, endDate: string): Promise<TimesheetEntry[]> {
    const { data, error } = await supabase
      .from('kp_timesheet')
      .select(`
        *,
        student:profiles!kp_timesheet_student_id_fkey(full_name, nim)
      `)
      .eq('student_id', studentId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return (data || []) as TimesheetEntry[];
  },

  async getAllTimesheets(startDate: string, endDate: string): Promise<TimesheetEntry[]> {
    const { data, error } = await supabase
      .from('kp_timesheet')
      .select(`
        *,
        student:profiles!kp_timesheet_student_id_fkey(full_name, nim)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return (data || []) as TimesheetEntry[];
  },

  async createTimesheet(timesheet: Omit<TimesheetEntry, 'id' | 'created_at' | 'updated_at' | 'duration_minutes' | 'student'>): Promise<TimesheetEntry> {
    const { data, error } = await supabase
      .from('kp_timesheet')
      .insert(timesheet)
      .select()
      .single();

    if (error) throw error;
    return data as TimesheetEntry;
  },

  async updateTimesheet(id: string, timesheet: Partial<TimesheetEntry>): Promise<TimesheetEntry> {
    const { data, error } = await supabase
      .from('kp_timesheet')
      .update(timesheet)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as TimesheetEntry;
  },

  async getTimesheetByDate(studentId: string, date: string): Promise<TimesheetEntry | null> {
    const { data, error } = await supabase
      .from('kp_timesheet')
      .select('*')
      .eq('student_id', studentId)
      .eq('date', date)
      .maybeSingle();

    if (error) throw error;
    return data as TimesheetEntry | null;
  }
};
