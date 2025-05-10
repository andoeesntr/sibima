
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Evaluation {
  id: string;
  student_id: string;
  evaluator_id: string;
  evaluator_type: 'supervisor' | 'field_supervisor';
  evaluation_date: string;
  score: number;
  comments: string | null;
  document_url: string | null;
  created_at?: string;
  student?: {
    full_name: string;
    nim: string;
  };
  evaluator?: {
    full_name: string;
  };
}

// Fetch all evaluations (for coordinator)
export const fetchAllEvaluations = async (): Promise<Evaluation[]> => {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        student:profiles!student_id (full_name, nim),
        evaluator:profiles!evaluator_id (full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as Evaluation[] || [];
  } catch (error: any) {
    console.error('Error fetching evaluations:', error);
    toast.error(`Failed to load evaluations: ${error.message}`);
    return [];
  }
};

// Fetch evaluations for a specific student
export const fetchStudentEvaluations = async (studentId: string): Promise<Evaluation[]> => {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        evaluator:profiles!evaluator_id (full_name)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as Evaluation[] || [];
  } catch (error: any) {
    console.error('Error fetching student evaluations:', error);
    toast.error(`Failed to load evaluations: ${error.message}`);
    return [];
  }
};

// Create a new evaluation
export const createEvaluation = async (evaluation: Omit<Evaluation, 'id' | 'created_at' | 'evaluation_date'>): Promise<Evaluation | null> => {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .insert({
        ...evaluation,
        evaluation_date: new Date().toISOString()
      })
      .select(`
        *,
        student:profiles!student_id (full_name, nim),
        evaluator:profiles!evaluator_id (full_name)
      `)
      .single();

    if (error) {
      throw error;
    }

    toast.success('Evaluation successfully added');
    return data as Evaluation;
  } catch (error: any) {
    console.error('Error creating evaluation:', error);
    toast.error(`Failed to create evaluation: ${error.message}`);
    return null;
  }
};

// Update an evaluation
export const updateEvaluation = async (id: string, updates: Partial<Evaluation>): Promise<Evaluation | null> => {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        student:profiles!student_id (full_name, nim),
        evaluator:profiles!evaluator_id (full_name)
      `)
      .single();

    if (error) {
      throw error;
    }

    toast.success('Evaluation successfully updated');
    return data as Evaluation;
  } catch (error: any) {
    console.error('Error updating evaluation:', error);
    toast.error(`Failed to update evaluation: ${error.message}`);
    return null;
  }
};

// Delete an evaluation
export const deleteEvaluation = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    toast.success('Evaluation successfully deleted');
    return true;
  } catch (error: any) {
    console.error('Error deleting evaluation:', error);
    toast.error(`Failed to delete evaluation: ${error.message}`);
    return false;
  }
};

// Calculate final grade for a student
export const calculateFinalGrade = async (studentId: string): Promise<{score: number, breakdown: {[key: string]: number}} | null> => {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select('evaluator_type, score')
      .eq('student_id', studentId);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Group scores by evaluator type
    const scoresByType: {[key: string]: number[]} = {};
    
    data.forEach(evaluation => {
      if (!scoresByType[evaluation.evaluator_type]) {
        scoresByType[evaluation.evaluator_type] = [];
      }
      scoresByType[evaluation.evaluator_type].push(evaluation.score);
    });

    // Calculate average for each type
    const averageScores: {[key: string]: number} = {};
    
    Object.keys(scoresByType).forEach(type => {
      const scores = scoresByType[type];
      const sum = scores.reduce((total, score) => total + score, 0);
      averageScores[type] = sum / scores.length;
    });

    // Calculate final score (60% supervisor + 40% field supervisor)
    const supervisorScore = averageScores['supervisor'] || 0;
    const fieldSupervisorScore = averageScores['field_supervisor'] || 0;
    
    const finalScore = supervisorScore * 0.6 + fieldSupervisorScore * 0.4;

    return {
      score: parseFloat(finalScore.toFixed(2)),
      breakdown: averageScores
    };
  } catch (error: any) {
    console.error('Error calculating final grade:', error);
    toast.error(`Failed to calculate final grade: ${error.message}`);
    return null;
  }
};
