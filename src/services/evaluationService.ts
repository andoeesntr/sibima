
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Evaluation {
  id: string;
  student_id: string;
  evaluator_id: string;
  evaluator_type: 'supervisor' | 'field_supervisor' | 'academic_supervisor';
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

// Expanded type for grade calculation results
export interface GradeResult {
  score: number;
  academicSupervisorScore?: number;
  fieldSupervisorScore?: number;
  letterGrade?: string;
}

// Calculate final grade for a student
export const calculateFinalGrade = async (studentId: string): Promise<GradeResult | null> => {
  try {
    // Fetch all evaluations for the student
    const { data: evaluations, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching evaluations:', error);
      return null;
    }

    if (!evaluations || evaluations.length === 0) {
      return null;
    }

    // Separate evaluations by evaluator type
    const academicEvaluations = evaluations.filter(
      (evaluation) => evaluation.evaluator_type === 'supervisor' || evaluation.evaluator_type === 'academic_supervisor'
    );
    const fieldEvaluations = evaluations.filter(
      (evaluation) => evaluation.evaluator_type === 'field_supervisor'
    );
    const coordinatorEvaluations = evaluations.filter(
      (evaluation) => evaluation.evaluator_type === 'coordinator'
    );
    
    // Calculate average scores
    let academicScore = 0;
    let fieldScore = 0;
    let coordinatorScore = 0;

    if (academicEvaluations.length > 0) {
      academicScore = academicEvaluations.reduce((sum, evaluation) => sum + Number(evaluation.score), 0) / academicEvaluations.length;
    }

    if (fieldEvaluations.length > 0) {
      fieldScore = fieldEvaluations.reduce((sum, evaluation) => sum + Number(evaluation.score), 0) / fieldEvaluations.length;
    }

    if (coordinatorEvaluations.length > 0) {
      coordinatorScore = coordinatorEvaluations.reduce((sum, evaluation) => sum + Number(evaluation.score), 0) / coordinatorEvaluations.length;
    }

    // Calculate final score with weights (customize as needed)
    // For example: 60% academic, 40% field
    let weightedScore = 0;
    let letterGrade = '';
    
    if (academicScore > 0 && fieldScore > 0) {
      weightedScore = (academicScore * 0.6) + (fieldScore * 0.4);
    } else if (academicScore > 0) {
      weightedScore = academicScore;
    } else if (fieldScore > 0) {
      weightedScore = fieldScore;
    }
    
    // Calculate letter grade
    if (weightedScore >= 85) {
      letterGrade = 'A';
    } else if (weightedScore >= 70) {
      letterGrade = 'B';
    } else if (weightedScore >= 55) {
      letterGrade = 'C';
    } else if (weightedScore >= 40) {
      letterGrade = 'D';
    } else {
      letterGrade = 'E';
    }

    // Return formatted result
    return {
      score: weightedScore || 0,
      academicSupervisorScore: academicEvaluations.length > 0 ? academicScore : undefined,
      fieldSupervisorScore: fieldEvaluations.length > 0 ? fieldScore : undefined,
      letterGrade
    };
  } catch (error) {
    console.error('Error calculating final grade:', error);
    toast.error('Gagal menghitung nilai akhir');
    return null;
  }
};
