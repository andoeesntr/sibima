
import { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
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
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Penilaian Mahasiswa</h2>
        <Button onClick={handleOpenAddDialog} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Tambah Penilaian
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Penilaian KP</CardTitle>
          <CardDescription>
            Daftar nilai mahasiswa yang telah mengikuti KP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EvaluationTable 
            evaluations={evaluations} 
            loading={loading}
            onEdit={handleEditEvaluation}
            onRefresh={loadEvaluations}
          />
        </CardContent>
      </Card>
      
      <AddEvaluationDialog
        open={openAddDialog}
        onClose={handleDialogClose}
        onEvaluationAdded={handleEvaluationAdded}
        evaluation={editingEvaluation}
        existingStudentIds={evaluations.map(e => e.student_id)}
      />
    </div>
  );
};

export default StudentEvaluation;
