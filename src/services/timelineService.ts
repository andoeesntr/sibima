
import { supabase } from '@/integrations/supabase/client';
import { TimelineStep } from '@/types/timeline';
import { toast } from 'sonner';

// Default timeline steps if none exist in database
const defaultTimelineSteps: TimelineStep[] = [
  {
    id: '1',
    title: "Sosialisasi KP",
    period: "Juni",
    description: "Pengenalan program Kerja Praktik kepada mahasiswa"
  },
  {
    id: '2',
    title: "Pendaftaran KP",
    period: "1 Juli",
    description: "Periode pendaftaran untuk program Kerja Praktik dibuka"
  },
  {
    id: '3',
    title: "Penutupan Daftar KP",
    period: "7 Juli",
    description: "Batas akhir pendaftaran Kerja Praktik"
  },
  {
    id: '4',
    title: "Pelaksanaan KP",
    period: "Agustus - Oktober",
    description: "Pelaksanaan Kerja Praktik selama 3 bulan dengan 8x bimbingan"
  },
  {
    id: '5',
    title: "Bimbingan Terjadwal",
    period: "1 Minggu (2x)",
    description: "Bimbingan intensif terjadwal dengan dosen pembimbing"
  },
  {
    id: '6',
    title: "Expo KP",
    period: "Oktober",
    description: "Presentasi hasil Kerja Praktik"
  },
];

export const fetchTimelineSteps = async (): Promise<TimelineStep[]> => {
  try {
    // Check if we have timeline data in the database
    const { data, error } = await supabase
      .from('kp_timeline')
      .select('*')
      .order('id');

    if (error) {
      throw error;
    }

    // If we don't have timeline data or it's empty, return default steps
    if (!data || data.length === 0) {
      return defaultTimelineSteps;
    }

    return data as TimelineStep[];
  } catch (error) {
    console.error('Error fetching timeline steps:', error);
    // Return default steps if anything goes wrong
    return defaultTimelineSteps;
  }
};

export const updateTimelineStep = async (step: TimelineStep): Promise<TimelineStep | null> => {
  if (!step || !step.title || !step.period) {
    toast.error('Invalid timeline step data');
    return null;
  }

  try {
    // Make sure we have a valid step object with all required fields
    const stepToUpdate = {
      title: step.title.trim(),
      period: step.period.trim(),
      description: step.description || '',
    };

    let result;
    
    // Check if we're dealing with a numeric ID (from default steps)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(step.id)) {
      // For non-UUID IDs, create a new record
      const { data, error } = await supabase
        .from('kp_timeline')
        .insert(stepToUpdate)
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    } else {
      // For valid UUIDs, update the existing record
      const { data, error } = await supabase
        .from('kp_timeline')
        .update(stepToUpdate)
        .eq('id', step.id)
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    }

    if (!result) {
      throw new Error('No data returned after update');
    }

    return result as TimelineStep;
  } catch (error: any) {
    console.error('Error updating timeline step:', error);
    toast.error(`Failed to update timeline step: ${error.message}`);
    return null;
  }
};

// Helper function to initialize the timeline with default data
export const initializeTimeline = async (): Promise<void> => {
  try {
    // Check if timeline data already exists
    const { data, error } = await supabase
      .from('kp_timeline')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    // If no timeline data exists, insert the default steps
    if (!data || data.length === 0) {
      const stepsToInsert = defaultTimelineSteps.map(step => ({
        title: step.title,
        period: step.period,
        description: step.description || ''
      }));
      
      const { error: insertError } = await supabase
        .from('kp_timeline')
        .insert(stepsToInsert);

      if (insertError) {
        throw insertError;
      }
      
      console.log('Timeline initialized with default data');
    }
  } catch (error) {
    console.error('Error initializing timeline:', error);
  }
};
