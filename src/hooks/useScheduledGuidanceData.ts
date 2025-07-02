
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface GuidanceData {
  id: string;
  student_id: string;
  requested_date: string;
  location: string | null;
  topic: string | null;
  status: string;
  meeting_link: string | null;
  supervisor_notes: string | null;
  created_at: string;
  student: {
    full_name: string;
    nim: string;
  } | null;
}

export interface ProcessedGuidance {
  id: string;
  student_id: string;
  requested_date: string;
  location: string;
  topic: string;
  status: string;
  meeting_link: string;
  supervisor_notes: string;
  created_at: string;
  student_name: string;
  student_nim: string;
}

export interface UniqueStudent {
  id: string;
  name: string;
  nim: string;
}

export const useScheduledGuidanceData = () => {
  const [guidanceRequests, setGuidanceRequests] = useState<ProcessedGuidance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  const fetchScheduledGuidanceRequests = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kp_guidance_schedule')
        .select(`
          *,
          student:profiles!kp_guidance_schedule_student_id_fkey (
            full_name,
            nim
          )
        `)
        .eq('supervisor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching guidance requests:', error);
        toast.error('Gagal memuat permintaan bimbingan terjadwal');
        return;
      }

      console.log('Fetched scheduled guidance requests for supervisor:', data);
      
      const transformedData: ProcessedGuidance[] = (data as GuidanceData[] || []).map(item => ({
        id: item.id,
        student_id: item.student_id,
        requested_date: item.requested_date,
        location: item.location || '',
        topic: item.topic || '',
        status: item.status,
        meeting_link: item.meeting_link || '',
        supervisor_notes: item.supervisor_notes || '',
        created_at: item.created_at,
        student_name: item.student?.full_name || 'Unknown Student',
        student_nim: item.student?.nim || 'Unknown'
      }));

      setGuidanceRequests(transformedData);
    } catch (error) {
      console.error('Error fetching scheduled guidance requests:', error);
      toast.error('Gagal memuat permintaan bimbingan terjadwal');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('kp_guidance_schedule')
        .update({ 
          status,
          supervisor_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(`Permintaan bimbingan terjadwal ${status === 'approved' ? 'disetujui' : 'ditolak'}`);
      fetchScheduledGuidanceRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Gagal mengupdate status permintaan');
    }
  };

  const getUniqueStudents = (): UniqueStudent[] => {
    return guidanceRequests.reduce((acc: UniqueStudent[], request) => {
      if (!acc.find(s => s.id === request.student_id)) {
        acc.push({
          id: request.student_id,
          name: request.student_name,
          nim: request.student_nim
        });
      }
      return acc;
    }, []);
  };

  useEffect(() => {
    fetchScheduledGuidanceRequests();
  }, [user?.id]);

  return {
    guidanceRequests,
    loading,
    updateRequestStatus,
    getUniqueStudents,
    refetch: fetchScheduledGuidanceRequests
  };
};
