
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import EvaluationTable from "@/components/coordinator/evaluation/EvaluationTable";
import AddEvaluationDialog from "@/components/coordinator/evaluation/AddEvaluationDialog";
import { fetchAllEvaluations } from '@/services/evaluationService';
import { Evaluation } from '@/services/evaluationService';
import { toast } from 'sonner';

const StudentEvaluation = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    loadEvaluations();
  }, []);
  
  const loadEvaluations = async () => {
    setLoading(true);
    try {
      const data = await fetchAllEvaluations();
      setEvaluations(data);
    } catch (error) {
      console.error('Failed to load evaluations:', error);
      toast.error('Gagal memuat data penilaian');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddEvaluation = (newEvaluation: Evaluation) => {
    setEvaluations(prevEvaluations => [...prevEvaluations, newEvaluation]);
    toast.success('Penilaian berhasil ditambahkan');
  };
  
  const handleEditEvaluation = (updatedEvaluation: Evaluation) => {
    setEvaluations(prevEvaluations => 
      prevEvaluations.map(evaluation => 
        evaluation.id === updatedEvaluation.id ? updatedEvaluation : evaluation
      )
    );
    toast.success('Penilaian berhasil diperbarui');
  };
  
  const handleDeleteEvaluation = (id: string) => {
    // When deleting one evaluation, we should delete both evaluations for the student
    const evaluationToDelete = evaluations.find(e => e.id === id);
    if (evaluationToDelete) {
      const studentId = evaluationToDelete.student_id;
      // Filter out all evaluations for this student
      setEvaluations(prevEvaluations => 
        prevEvaluations.filter(evaluation => evaluation.student_id !== studentId)
      );
      toast.success('Penilaian mahasiswa berhasil dihapus');
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Penilaian KP Mahasiswa</h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Nilai KP Mahasiswa</CardTitle>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Data
          </Button>
        </CardHeader>
        <CardContent>
          <EvaluationTable 
            evaluations={evaluations}
            loading={loading}
            onEditEvaluation={handleEditEvaluation}
            onDeleteEvaluation={handleDeleteEvaluation}
          />
        </CardContent>
      </Card>
      
      <AddEvaluationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddEvaluation={handleAddEvaluation}
        existingEvaluations={evaluations}
      />
    </div>
  );
};

export default StudentEvaluation;
