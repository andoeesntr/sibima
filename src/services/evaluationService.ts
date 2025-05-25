
import { supabase } from '@/integrations/supabase/client';

export interface Evaluation {
  id: string;
  student_id: string;
  evaluator_id: string;
  evaluator_type: 'supervisor' | 'field_supervisor';
  score: number;
  comments?: string;
  evaluation_date: string;
  document_url?: string;
  student?: {
    full_name: string;
    nim: string;
  };
  evaluator?: {
    full_name: string;
  };
}

export const fetchAllEvaluations = async (): Promise<Evaluation[]> => {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        student:profiles!student_id(full_name, nim),
        evaluator:profiles!evaluator_id(full_name)
      `)
      .order('evaluation_date', { ascending: false });

    if (error) {
      console.error('Error fetching evaluations:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchAllEvaluations:', error);
    throw error;
  }
};

export const fetchStudentEvaluations = async (studentId: string): Promise<Evaluation[]> => {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        student:profiles!student_id(full_name, nim),
        evaluator:profiles!evaluator_id(full_name)
      `)
      .eq('student_id', studentId)
      .order('evaluation_date', { ascending: false });

    if (error) {
      console.error('Error fetching student evaluations:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchStudentEvaluations:', error);
    throw error;
  }
};

export const createEvaluation = async (evaluationData: {
  student_id: string;
  evaluator_id: string;
  evaluator_type: 'supervisor' | 'field_supervisor';
  score: number;
  comments?: string;
  document_url?: string;
}): Promise<Evaluation> => {
  try {
    // Get current user info for activity log
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user?.id)
      .single();

    // Get student info for activity log
    const { data: student } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', evaluationData.student_id)
      .single();

    const { data, error } = await supabase
      .from('evaluations')
      .insert(evaluationData)
      .select(`
        *,
        student:profiles!student_id(full_name, nim),
        evaluator:profiles!evaluator_id(full_name)
      `)
      .single();

    if (error) {
      console.error('Error creating evaluation:', error);
      throw error;
    }

    // Log the activity
    await supabase.from('activity_logs').insert({
      action: `Menambahkan penilaian untuk ${student?.full_name} dengan nilai ${evaluationData.score}`,
      target_type: 'evaluation',
      target_id: data.id,
      user_id: user?.id || 'coordinator',
      user_name: profile?.full_name || 'Coordinator'
    });

    return data;
  } catch (error) {
    console.error('Error in createEvaluation:', error);
    throw error;
  }
};

export const updateEvaluation = async (
  id: string,
  updates: Partial<Evaluation>
): Promise<Evaluation> => {
  try {
    // Get current user info for activity log
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user?.id)
      .single();

    // Get current evaluation for activity log
    const { data: currentEvaluation } = await supabase
      .from('evaluations')
      .select('student_id, profiles!student_id(full_name)')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('evaluations')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        student:profiles!student_id(full_name, nim),
        evaluator:profiles!evaluator_id(full_name)
      `)
      .single();

    if (error) {
      console.error('Error updating evaluation:', error);
      throw error;
    }

    // Log the activity
    await supabase.from('activity_logs').insert({
      action: `Mengedit penilaian untuk ${currentEvaluation?.profiles?.full_name}`,
      target_type: 'evaluation',
      target_id: id,
      user_id: user?.id || 'coordinator',
      user_name: profile?.full_name || 'Coordinator'
    });

    return data;
  } catch (error) {
    console.error('Error in updateEvaluation:', error);
    throw error;
  }
};

export const deleteEvaluation = async (id: string): Promise<boolean> => {
  try {
    // Get current user info for activity log
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user?.id)
      .single();

    // Get evaluation info for activity log
    const { data: evaluation } = await supabase
      .from('evaluations')
      .select('student_id, profiles!student_id(full_name)')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting evaluation:', error);
      throw error;
    }

    // Log the activity
    await supabase.from('activity_logs').insert({
      action: `Menghapus penilaian untuk ${evaluation?.profiles?.full_name}`,
      target_type: 'evaluation',
      target_id: id,
      user_id: user?.id || 'coordinator',
      user_name: profile?.full_name || 'Coordinator'
    });

    return true;
  } catch (error) {
    console.error('Error in deleteEvaluation:', error);
    return false;
  }
};
