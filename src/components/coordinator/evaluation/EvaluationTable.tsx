
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Evaluation } from '@/services/evaluationService';
import EditEvaluationDialog from './EditEvaluationDialog';
import DeleteEvaluationDialog from './DeleteEvaluationDialog';

interface EvaluationTableProps {
  evaluations: Evaluation[];
  loading: boolean;
  onEditEvaluation: (evaluation: Evaluation) => void;
  onDeleteEvaluation: (id: string) => void;
}

const EvaluationTable = ({ 
  evaluations, 
  loading, 
  onEditEvaluation, 
  onDeleteEvaluation 
}: EvaluationTableProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null);
  
  const handleEditClick = (evaluation: Evaluation) => {
    setCurrentEvaluation(evaluation);
    setEditDialogOpen(true);
  };
  
  const handleDeleteClick = (evaluation: Evaluation) => {
    setCurrentEvaluation(evaluation);
    setDeleteDialogOpen(true);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Memuat data...</p>
        </div>
      </div>
    );
  }
  
  if (evaluations.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Belum ada data penilaian</p>
      </div>
    );
  }
  
  // Group evaluations by student
  const studentEvaluations: Record<string, {
    student_name: string,
    academic_score?: number,
    field_score?: number,
    final_score: number,
    evaluations: Evaluation[]
  }> = {};
  
  evaluations.forEach(evaluation => {
    const studentId = evaluation.student_id;
    const studentName = evaluation.student?.full_name || 'Unknown Student';
    
    if (!studentEvaluations[studentId]) {
      studentEvaluations[studentId] = {
        student_name: studentName,
        evaluations: [],
        final_score: 0
      };
    }
    
    // Add the evaluation to the student's evaluation array
    studentEvaluations[studentId].evaluations.push(evaluation);
    
    // Update the academic or field score based on the evaluator type
    if (evaluation.evaluator_type === 'supervisor') {
      studentEvaluations[studentId].academic_score = evaluation.score;
    } else if (evaluation.evaluator_type === 'field_supervisor') {
      studentEvaluations[studentId].field_score = evaluation.score;
    }
    
    // Calculate the final score if both scores are present
    if (studentEvaluations[studentId].academic_score !== undefined && 
        studentEvaluations[studentId].field_score !== undefined) {
      const academic = studentEvaluations[studentId].academic_score!;
      const field = studentEvaluations[studentId].field_score!;
      studentEvaluations[studentId].final_score = academic * 0.6 + field * 0.4;
    }
  });
  
  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Daftar nilai KP mahasiswa</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Nilai Pembimbing Akademik</TableHead>
              <TableHead>Nilai Pembimbing Lapangan</TableHead>
              <TableHead>Nilai Akhir</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.values(studentEvaluations).map((student) => (
              <TableRow key={student.evaluations[0].student_id}>
                <TableCell className="font-medium">
                  {student.student_name}
                </TableCell>
                <TableCell>
                  {student.academic_score !== undefined ? student.academic_score : '-'}
                </TableCell>
                <TableCell>
                  {student.field_score !== undefined ? student.field_score : '-'}
                </TableCell>
                <TableCell>
                  {(student.academic_score !== undefined && student.field_score !== undefined) ? 
                    student.final_score.toFixed(2) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {student.evaluations.map(evaluation => (
                      <Button 
                        key={evaluation.id}
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditClick(evaluation)}
                        className="mr-1"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteClick(student.evaluations[0])}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {currentEvaluation && (
        <>
          <EditEvaluationDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            evaluation={currentEvaluation}
            onSave={onEditEvaluation}
          />
          
          <DeleteEvaluationDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            evaluation={currentEvaluation}
            onDelete={onDeleteEvaluation}
          />
        </>
      )}
    </>
  );
};

export default EvaluationTable;
