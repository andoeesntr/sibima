
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GuidanceSession {
  id: string;
  student_id: string;
  supervisor_id: string;
  session_date: string;
  session_type: string;
  status: string;
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

// Fetch all guidance sessions (for coordinator)
export const fetchAllGuidanceSessions = async (): Promise<GuidanceSession[]> => {
  try {
    const { data, error } = await supabase
      .from('guidance_sessions')
      .select(`
        *,
        student:profiles!student_id (full_name, nim),
        supervisor:profiles!supervisor_id (full_name)
      `)
      .order('created_at', { ascending: false });

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

// Create a new guidance session
export const createGuidanceSession = async (session: Omit<GuidanceSession, 'id' | 'created_at' | 'updated_at'>): Promise<GuidanceSession | null> => {
  try {
    const { data, error } = await supabase
      .from('guidance_sessions')
      .insert({
        student_id: session.student_id,
        supervisor_id: session.supervisor_id,
        session_date: session.session_date,
        session_type: session.session_type,
        status: session.status
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success('Guidance session scheduled successfully');
    return data as GuidanceSession;
  } catch (error: any) {
    console.error('Error scheduling guidance session:', error);
    toast.error(`Failed to schedule guidance session: ${error.message}`);
    return null;
  }
};

// Submit report for a guidance session
export const submitGuidanceReport = async (report: Omit<GuidanceReport, 'id' | 'submitted_at'>): Promise<GuidanceReport | null> => {
  try {
    const { data, error } = await supabase
      .from('guidance_reports')
      .insert(report)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success('Guidance report submitted successfully');
    return data as GuidanceReport;
  } catch (error: any) {
    console.error('Error submitting guidance report:', error);
    toast.error(`Failed to submit guidance report: ${error.message}`);
    return null;
  }
};
