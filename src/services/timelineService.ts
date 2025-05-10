
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
      id: step.id,
      title: step.title.trim(),
      period: step.period.trim(),
      description: step.description || '',
    };

    // First check if the step exists
    const { data: existingStep, error: checkError } = await supabase
      .from('kp_timeline')
      .select('id')
      .eq('id', step.id)
      .single();
    
    let result;
    
    if (checkError || !existingStep) {
      // Generate a proper UUID if it's not already one
      let id = step.id;
      if (!isUUID(id)) {
        // Use the numeric id to generate a deterministic UUID
        id = generateDeterministicUUID(id);
        stepToUpdate.id = id;
      }
      
      // Insert if it doesn't exist
      const { data, error } = await supabase
        .from('kp_timeline')
        .insert(stepToUpdate)
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    } else {
      // Update if it exists
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

// Helper function to check if a string is a valid UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Helper function to generate a deterministic UUID from a string
function generateDeterministicUUID(input: string): string {
  // This is a simplified UUID generator for demonstration
  // In production, you might want to use a more robust approach
  const prefix = '00000000-0000-4000-8000-';
  const paddedInput = input.padStart(12, '0');
  return prefix + paddedInput;
}

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
      // Transform default steps to ensure all IDs are valid UUIDs
      const stepsWithUUIDs = defaultTimelineSteps.map(step => ({
        ...step,
        id: isUUID(step.id) ? step.id : generateDeterministicUUID(step.id)
      }));
      
      const { error: insertError } = await supabase
        .from('kp_timeline')
        .insert(stepsWithUUIDs);

      if (insertError) {
        throw insertError;
      }
      
      console.log('Timeline initialized with default data');
    }
  } catch (error) {
    console.error('Error initializing timeline:', error);
  }
};
