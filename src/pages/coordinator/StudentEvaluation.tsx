
import { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import EvaluationTable from '@/components/coordinator/evaluation/EvaluationTable';
import AddEvaluationDialog from '@/components/coordinator/evaluation/AddEvaluationDialog';
import { fetchAllEvaluations, Evaluation } from '@/services/evaluationService';

const StudentEvaluation = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  
  const loadEvaluations = async () => {
    setLoading(true);
    try {
      const data = await fetchAllEvaluations();
      setEvaluations(data);
    } catch (error) {
      console.error('Error loading evaluations:', error);
      toast.error('Failed to load evaluation data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadEvaluations();
  }, []);
  
  const handleOpenAddDialog = () => {
    setEditingEvaluation(null);
    setOpenAddDialog(true);
  };
  
  const handleEditEvaluation = (evaluation: Evaluation) => {
    setEditingEvaluation(evaluation);
    setOpenAddDialog(true);
  };
  
  const handleDialogClose = () => {
    setOpenAddDialog(false);
    setEditingEvaluation(null);
  };
  
  const handleEvaluationAdded = () => {
    loadEvaluations();
    setOpenAddDialog(false);
    setEditingEvaluation(null);
  };
  
  // Get unique student IDs that already have evaluations
  const getExistingStudentIds = () => {
    const uniqueIds = new Set<string>();
    
    // Group evaluations by student and evaluator type to identify students with both evaluation types
    const studentEvaluationTypes: Record<string, Set<string>> = {};
    
    evaluations.forEach(evaluation => {
      if (!studentEvaluationTypes[evaluation.student_id]) {
        studentEvaluationTypes[evaluation.student_id] = new Set();
      }
      studentEvaluationTypes[evaluation.student_id].add(evaluation.evaluator_type);
      
      // If a student already has both types of evaluations, add them to uniqueIds
      if (studentEvaluationTypes[evaluation.student_id].size === 2) {
        uniqueIds.add(evaluation.student_id);
      }
    });
    
    return Array.from(uniqueIds);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Penilaian Mahasiswa</h1>
        <Button onClick={handleOpenAddDialog} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Tambah Penilaian
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Rekapitulasi Nilai Akhir</CardTitle>
          <CardDescription>
            Daftar nilai mahasiswa yang telah mengikuti KP
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : evaluations.length > 0 ? (
            <EvaluationTable 
              evaluations={evaluations} 
              loading={loading}
              onEdit={handleEditEvaluation}
              onRefresh={loadEvaluations}
            />
          ) : (
            <div className="text-center py-10">
              <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Belum ada penilaian</h3>
              <p className="text-gray-500">
                Silakan tambahkan penilaian mahasiswa menggunakan tombol di atas
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AddEvaluationDialog
        open={openAddDialog}
        onClose={handleDialogClose}
        onEvaluationAdded={handleEvaluationAdded}
        evaluation={editingEvaluation}
        existingStudentIds={getExistingStudentIds()}
      />
    </div>
  );
};

export default StudentEvaluation;
