
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Timesheet {
  id: string;
  student_id: string;
  entry_date: string;
  hours_worked: number;
  activity_description: string;
  evidence_url: string | null;
  approved_by_supervisor: boolean;
  created_at?: string;
  updated_at?: string;
  student?: {
    full_name: string;
    nim: string;
  };
}

// Fetch timesheet entries for a student
export const fetchStudentTimesheets = async (studentId: string): Promise<Timesheet[]> => {
  try {
    const { data, error } = await supabase
      .from('student_timesheets')
      .select('*')
      .eq('student_id', studentId)
      .order('entry_date', { ascending: false });

    if (error) {
      throw error;
    }

    return data as Timesheet[] || [];
  } catch (error: any) {
    console.error('Error fetching student timesheets:', error);
    toast.error(`Failed to load timesheets: ${error.message}`);
    return [];
  }
};

// Fetch all timesheet entries (for coordinator)
export const fetchAllTimesheets = async (): Promise<Timesheet[]> => {
  try {
    const { data, error } = await supabase
      .from('student_timesheets')
      .select(`
        *,
        student:profiles!student_id (full_name, nim)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as Timesheet[] || [];
  } catch (error: any) {
    console.error('Error fetching all timesheets:', error);
    toast.error(`Failed to load timesheets: ${error.message}`);
    return [];
  }
};

// Create a new timesheet entry
export const createTimesheetEntry = async (timesheet: Omit<Timesheet, 'id' | 'approved_by_supervisor' | 'created_at' | 'updated_at'>): Promise<Timesheet | null> => {
  try {
    const { data, error } = await supabase
      .from('student_timesheets')
      .insert(timesheet)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success('Timesheet entry successfully added');
    return data as Timesheet;
  } catch (error: any) {
    console.error('Error creating timesheet entry:', error);
    toast.error(`Failed to create timesheet entry: ${error.message}`);
    return null;
  }
};

// Update a timesheet approval status
export const approveTimesheetEntry = async (timesheetId: string, approved: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('student_timesheets')
      .update({ 
        approved_by_supervisor: approved,
        updated_at: new Date().toISOString() 
      })
      .eq('id', timesheetId);

    if (error) {
      throw error;
    }

    toast.success(`Timesheet entry ${approved ? 'approved' : 'rejected'}`);
    return true;
  } catch (error: any) {
    console.error('Error updating timesheet approval status:', error);
    toast.error(`Failed to update timesheet status: ${error.message}`);
    return false;
  }
};
