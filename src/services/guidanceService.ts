
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GuidanceSession {
  id: string;
  student_id: string;
  supervisor_id: string;
  session_date: string;
  session_type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  student?: {
    full_name: string;
    nim: string;
  };
  supervisor?: {
    full_name: string;
  };
}

export interface GuidanceReport {
  id: string;
  session_id: string;
  report_url: string | null;
  notes: string | null;
  submitted_at: string;
}

// Fetch guidance sessions for coordinator (all sessions)
export const fetchAllGuidanceSessions = async (): Promise<GuidanceSession[]> => {
  try {
    const { data, error } = await supabase
      .from('guidance_sessions')
      .select(`
        *,
        student:profiles!student_id (full_name, nim),
        supervisor:profiles!supervisor_id (full_name)
      `)
      .order('session_date', { ascending: false });

    if (error) {
      throw error;
    }

    return data as GuidanceSession[] || [];
  } catch (error: any) {
    console.error('Error fetching guidance sessions:', error);
    toast.error(`Failed to load guidance sessions: ${error.message}`);
    return [];
  }
};

// Fetch guidance sessions for a specific supervisor
export const fetchSupervisorGuidanceSessions = async (supervisorId: string): Promise<GuidanceSession[]> => {
  try {
    const { data, error } = await supabase
      .from('guidance_sessions')
      .select(`
        *,
        student:profiles!student_id (full_name, nim)
      `)
      .eq('supervisor_id', supervisorId)
      .order('session_date', { ascending: false });

    if (error) {
      throw error;
    }

    return data as GuidanceSession[] || [];
  } catch (error: any) {
    console.error('Error fetching supervisor guidance sessions:', error);
    toast.error(`Failed to load guidance sessions: ${error.message}`);
    return [];
  }
};

// Fetch guidance sessions for a specific student
export const fetchStudentGuidanceSessions = async (studentId: string): Promise<GuidanceSession[]> => {
  try {
    const { data, error } = await supabase
      .from('guidance_sessions')
      .select(`
        *,
        supervisor:profiles!supervisor_id (full_name)
      `)
      .eq('student_id', studentId)
      .order('session_date', { ascending: false });

    if (error) {
      throw error;
    }

    return data as GuidanceSession[] || [];
  } catch (error: any) {
    console.error('Error fetching student guidance sessions:', error);
    toast.error(`Failed to load guidance sessions: ${error.message}`);
    return [];
  }
};

// Create a new guidance session
export const createGuidanceSession = async (session: Omit<GuidanceSession, 'id' | 'created_at' | 'updated_at'>): Promise<GuidanceSession | null> => {
  try {
    const { data, error } = await supabase
      .from('guidance_sessions')
      .insert(session)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success('Jadwal bimbingan berhasil dibuat');
    return data as GuidanceSession;
  } catch (error: any) {
    console.error('Error creating guidance session:', error);
    toast.error(`Failed to create guidance session: ${error.message}`);
    return null;
  }
};

// Update a guidance session status
export const updateGuidanceSessionStatus = async (sessionId: string, status: 'scheduled' | 'completed' | 'cancelled'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('guidance_sessions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      throw error;
    }

    toast.success(`Status bimbingan berhasil diperbarui: ${status}`);
    return true;
  } catch (error: any) {
    console.error('Error updating guidance session status:', error);
    toast.error(`Failed to update session status: ${error.message}`);
    return false;
  }
};

// Submit a guidance report
export const submitGuidanceReport = async (report: Omit<GuidanceReport, 'id' | 'submitted_at'>): Promise<GuidanceReport | null> => {
  try {
    // First, insert the report
    const { data, error } = await supabase
      .from('guidance_reports')
      .insert(report)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Then update the session status to completed
    const updateResult = await updateGuidanceSessionStatus(report.session_id, 'completed');
    
    if (!updateResult) {
      console.warn('Report submitted but session status not updated');
    }

    toast.success('Laporan bimbingan berhasil disubmit');
    return data as GuidanceReport;
  } catch (error: any) {
    console.error('Error submitting guidance report:', error);
    toast.error(`Failed to submit guidance report: ${error.message}`);
    return null;
  }
};

// Fetch reports for a specific session
export const fetchGuidanceReport = async (sessionId: string): Promise<GuidanceReport | null> => {
  try {
    const { data, error } = await supabase
      .from('guidance_reports')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw error;
      }
      return null;
    }

    return data as GuidanceReport;
  } catch (error: any) {
    console.error('Error fetching guidance report:', error);
    toast.error(`Failed to load guidance report: ${error.message}`);
    return null;
  }
};
