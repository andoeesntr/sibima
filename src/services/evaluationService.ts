
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Evaluation {
  id: string;
  student_id: string;
  evaluator_type: 'supervisor' | 'field_supervisor';
  evaluator_id?: string;
  score: number;
  comments?: string;
  created_at?: string;
  updated_at?: string;
  student?: {
    id: string;
    full_name: string;
    nim?: string;
    profile_image?: string;
  };
  evaluator?: {
    id: string;
    name: string;
    profile_image?: string;
  };
}

export const fetchAllEvaluations = async (): Promise<Evaluation[]> => {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        student:student_id (id, full_name, nim, profile_image),
        evaluator:evaluator_id (id, name, profile_image)
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data as Evaluation[];
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return [];
  }
};

export const fetchStudentEvaluations = async (studentId: string): Promise<Evaluation[]> => {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        student:student_id (id, full_name, nim, profile_image),
        evaluator:evaluator_id (id, name, profile_image)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data as Evaluation[];
  } catch (error) {
    console.error('Error fetching student evaluations:', error);
    return [];
  }
};

export const createEvaluation = async (evaluation: Omit<Evaluation, 'id'>): Promise<Evaluation | null> => {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .insert(evaluation)
      .select(`
        *,
        student:student_id (id, full_name, nim, profile_image),
        evaluator:evaluator_id (id, name, profile_image)
      `)
      .single();
      
    if (error) throw error;
    return data as Evaluation;
  } catch (error) {
    console.error('Error creating evaluation:', error);
    toast.error('Gagal menambahkan penilaian');
    return null;
  }
};

export const deleteEvaluation = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    toast.error('Gagal menghapus penilaian');
    return false;
  }
};
