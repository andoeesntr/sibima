
import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Evaluation, calculateFinalGrade } from '@/services/evaluationService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EvaluationTableProps {
  evaluations: Evaluation[];
  loading: boolean;
  onEdit: (evaluation: Evaluation) => void;
  onRefresh: () => void;
}

interface StudentEvaluationData {
  student_id: string;
  student_name: string;
  student_nim: string;
  academic_score?: number;
  academic_evaluator?: string;
  field_score?: number;
  field_evaluator?: string;
  final_score?: number;
  academic_evaluation_id?: string;
  field_evaluation_id?: string;
}

const EvaluationTable: React.FC<EvaluationTableProps> = ({ 
  evaluations, loading, onEdit, onRefresh 
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEvaluation, setDeletingEvaluation] = useState<Evaluation | null>(null);
  
  // Group evaluations by student
  const groupedEvaluations: StudentEvaluationData[] = React.useMemo(() => {
    const studentMap: Record<string, StudentEvaluationData> = {};
    
    evaluations.forEach(evaluation => {
      const studentId = evaluation.student_id;
      
      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          student_id: studentId,
          student_name: evaluation.student?.full_name || 'Unknown',
          student_nim: evaluation.student?.nim || 'Unknown',
        };
      }
      
      if (evaluation.evaluator_type === 'supervisor') {
        studentMap[studentId].academic_score = evaluation.score;
        studentMap[studentId].academic_evaluator = evaluation.evaluator?.full_name;
        studentMap[studentId].academic_evaluation_id = evaluation.id;
      } else if (evaluation.evaluator_type === 'field_supervisor') {
        studentMap[studentId].field_score = evaluation.score;
        studentMap[studentId].field_evaluator = evaluation.evaluator?.full_name;
        studentMap[studentId].field_evaluation_id = evaluation.id;
      }
      
      // Calculate final score if both scores are available
      if (studentMap[studentId].academic_score !== undefined && 
          studentMap[studentId].field_score !== undefined) {
        const academicScore = studentMap[studentId].academic_score || 0;
        const fieldScore = studentMap[studentId].field_score || 0;
        studentMap[studentId].final_score = academicScore * 0.6 + fieldScore * 0.4;
      }
    });
    
    return Object.values(studentMap);
  }, [evaluations]);
  
  const handleEditClick = (studentData: StudentEvaluationData, evaluationType: 'supervisor' | 'field_supervisor') => {
    const evaluationId = evaluationType === 'supervisor' ? 
      studentData.academic_evaluation_id : studentData.field_evaluation_id;
      
    if (!evaluationId) return;
    
    const evaluation = evaluations.find(e => e.id === evaluationId);
    if (evaluation) {
      onEdit(evaluation);
    }
  };
  
  const handleDeleteClick = (evaluation: Evaluation) => {
    setDeletingEvaluation(evaluation);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!deletingEvaluation) return;
    
    try {
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', deletingEvaluation.id);
        
      if (error) throw error;
      
      toast.success('Penilaian berhasil dihapus');
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting evaluation:', error);
      toast.error(`Gagal menghapus penilaian: ${error.message}`);
    } finally {
      setDeleteDialogOpen(false);
      setDeletingEvaluation(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nama</TableHead>
              <TableHead>NIM</TableHead>
              <TableHead>Nilai Pembimbing Akademik</TableHead>
              <TableHead>Nilai Pembimbing Lapangan</TableHead>
              <TableHead>Nilai Akhir</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedEvaluations.map((student) => (
              <TableRow key={student.student_id}>
                <TableCell className="font-medium">{student.student_name}</TableCell>
                <TableCell>{student.student_nim}</TableCell>
                <TableCell>
                  {student.academic_score !== undefined ? (
                    <div className="flex items-center gap-2">
                      <span>{student.academic_score}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditClick(student, 'supervisor')}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : "-"}
                </TableCell>
                <TableCell>
                  {student.field_score !== undefined ? (
                    <div className="flex items-center gap-2">
                      <span>{student.field_score}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditClick(student, 'field_supervisor')}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : "-"}
                </TableCell>
                <TableCell>{student.final_score !== undefined ? student.final_score.toFixed(1) : "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {student.academic_evaluation_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const evaluation = evaluations.find(e => e.id === student.academic_evaluation_id);
                          if (evaluation) handleDeleteClick(evaluation);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {groupedEvaluations.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Belum ada data penilaian
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Penilaian</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus penilaian ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 text-white hover:bg-red-600">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EvaluationTable;
