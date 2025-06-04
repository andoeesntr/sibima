
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
  topic?: string;
  location?: string;
  duration_minutes?: number;
  meeting_link?: string;
  supervisor_notes?: string;
}

export interface GuidanceReport {
  id: string;
  session_id: string;
  report_url: string | null;
  notes: string | null;
  submitted_at: string;
}

// Fetch all guidance sessions (for coordinator) - includes both tables
export const fetchAllGuidanceSessions = async (): Promise<GuidanceSession[]> => {
  try {
    console.log('Fetching all guidance sessions...');
    
    // Fetch from guidance_sessions table
    const { data: guidanceSessions, error: guidanceError } = await supabase
      .from('guidance_sessions')
      .select(`
        *,
        student:profiles!guidance_sessions_student_id_fkey (full_name, nim),
        supervisor:profiles!guidance_sessions_supervisor_id_fkey (full_name)
      `)
      .order('created_at', { ascending: false });

    if (guidanceError) {
      console.error('Error fetching guidance_sessions:', guidanceError);
      throw guidanceError;
    }

    // Fetch from kp_guidance_schedule table
    const { data: kpGuidanceSchedule, error: kpError } = await supabase
      .from('kp_guidance_schedule')
      .select(`
        *,
        student:profiles!kp_guidance_schedule_student_id_fkey (full_name, nim),
        supervisor:profiles!kp_guidance_schedule_supervisor_id_fkey (full_name)
      `)
      .order('created_at', { ascending: false });

    if (kpError) {
      console.error('Error fetching kp_guidance_schedule:', kpError);
      throw kpError;
    }

    console.log('Found guidance_sessions:', guidanceSessions?.length || 0);
    console.log('Found kp_guidance_schedule:', kpGuidanceSchedule?.length || 0);

    // Convert kp_guidance_schedule to GuidanceSession format
    const convertedKpSessions: GuidanceSession[] = (kpGuidanceSchedule || []).map(session => ({
      id: session.id,
      student_id: session.student_id,
      supervisor_id: session.supervisor_id,
      session_date: session.requested_date,
      session_type: session.topic || 'Bimbingan Umum',
      status: session.status,
      created_at: session.created_at,
      updated_at: session.updated_at,
      student: session.student,
      supervisor: session.supervisor,
      topic: session.topic,
      location: session.location,
      duration_minutes: session.duration_minutes,
      meeting_link: session.meeting_link,
      supervisor_notes: session.supervisor_notes
    }));

    // Combine both arrays
    const allSessions = [...(guidanceSessions || []), ...convertedKpSessions];
    
    // Sort by created_at
    allSessions.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());

    console.log('Total combined sessions:', allSessions.length);
    return allSessions;
  } catch (error: any) {
    console.error('Error fetching guidance sessions:', error);
    toast.error(`Failed to load guidance sessions: ${error.message}`);
    return [];
  }
};

// Fetch guidance sessions for a specific supervisor - includes both tables
export const fetchSupervisorGuidanceSessions = async (supervisorId: string): Promise<GuidanceSession[]> => {
  try {
    console.log('Fetching supervisor guidance sessions for:', supervisorId);
    
    // Fetch from guidance_sessions table
    const { data: guidanceSessions, error: guidanceError } = await supabase
      .from('guidance_sessions')
      .select(`
        *,
        student:profiles!guidance_sessions_student_id_fkey (full_name, nim),
        supervisor:profiles!guidance_sessions_supervisor_id_fkey (full_name)
      `)
      .eq('supervisor_id', supervisorId)
      .order('session_date', { ascending: false });

    if (guidanceError) {
      console.error('Error fetching supervisor guidance_sessions:', guidanceError);
      throw guidanceError;
    }

    // Fetch from kp_guidance_schedule table
    const { data: kpGuidanceSchedule, error: kpError } = await supabase
      .from('kp_guidance_schedule')
      .select(`
        *,
        student:profiles!kp_guidance_schedule_student_id_fkey (full_name, nim),
        supervisor:profiles!kp_guidance_schedule_supervisor_id_fkey (full_name)
      `)
      .eq('supervisor_id', supervisorId)
      .order('requested_date', { ascending: false });

    if (kpError) {
      console.error('Error fetching supervisor kp_guidance_schedule:', kpError);
      throw kpError;
    }

    console.log('Found supervisor guidance_sessions:', guidanceSessions?.length || 0);
    console.log('Found supervisor kp_guidance_schedule:', kpGuidanceSchedule?.length || 0);

    // Convert kp_guidance_schedule to GuidanceSession format
    const convertedKpSessions: GuidanceSession[] = (kpGuidanceSchedule || []).map(session => ({
      id: session.id,
      student_id: session.student_id,
      supervisor_id: session.supervisor_id,
      session_date: session.requested_date,
      session_type: session.topic || 'Bimbingan Umum',
      status: session.status,
      created_at: session.created_at,
      updated_at: session.updated_at,
      student: session.student,
      supervisor: session.supervisor,
      topic: session.topic,
      location: session.location,
      duration_minutes: session.duration_minutes,
      meeting_link: session.meeting_link,
      supervisor_notes: session.supervisor_notes
    }));

    // Combine both arrays
    const allSessions = [...(guidanceSessions || []), ...convertedKpSessions];
    
    // Sort by session_date/requested_date
    allSessions.sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());

    console.log('Total supervisor sessions:', allSessions.length);
    return allSessions;
  } catch (error: any) {
    console.error('Error fetching supervisor guidance sessions:', error);
    toast.error(`Failed to load guidance sessions: ${error.message}`);
    return [];
  }
};

// Fetch students and supervisors for dropdowns
export const fetchStudentsAndSupervisors = async () => {
  try {
    // Get students (users with role 'student')
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id, full_name, nim')
      .eq('role', 'student')
      .order('full_name');

    if (studentsError) throw studentsError;

    // Get supervisors (users with role 'supervisor')
    const { data: supervisors, error: supervisorsError } = await supabase
      .from('profiles')
      .select('id, full_name, nip')
      .eq('role', 'supervisor')
      .order('full_name');

    if (supervisorsError) throw supervisorsError;

    return {
      students: students || [],
      supervisors: supervisors || []
    };
  } catch (error: any) {
    console.error('Error fetching students and supervisors:', error);
    toast.error(`Failed to load students and supervisors: ${error.message}`);
    return {
      students: [],
      supervisors: []
    };
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
      .select(`
        *,
        student:profiles!guidance_sessions_student_id_fkey (full_name, nim),
        supervisor:profiles!guidance_sessions_supervisor_id_fkey (full_name)
      `)
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
