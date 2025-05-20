
import { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
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
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  
  // Group evaluations by student ID
  const groupedEvaluations = evaluations.reduce((acc, evaluation) => {
    const studentId = evaluation.student_id;
    if (!acc[studentId]) {
      acc[studentId] = [];
    }
    acc[studentId].push(evaluation);
    return acc;
  }, {} as Record<string, Evaluation[]>);
  
  const handleEdit = (studentId: string) => {
    const studentEvaluations = groupedEvaluations[studentId];
    if (studentEvaluations && studentEvaluations.length > 0) {
      setSelectedEvaluation(studentEvaluations[0]);
      setEditDialogOpen(true);
    }
  };
  
  const handleDelete = (studentId: string) => {
    const studentEvaluations = groupedEvaluations[studentId];
    if (studentEvaluations && studentEvaluations.length > 0) {
      setSelectedEvaluation(studentEvaluations[0]);
      setDeleteDialogOpen(true);
    }
  };
  
  // Calculate final score: 60% academic + 40% field supervisor
  const calculateFinalScore = (studentEvaluations: Evaluation[]) => {
    if (studentEvaluations.length === 0) return 0;
    
    const supervisorEval = studentEvaluations.find(e => e.evaluator_type === 'supervisor');
    const fieldSupervisorEval = studentEvaluations.find(e => e.evaluator_type === 'field_supervisor');
    
    const academicScore = supervisorEval ? supervisorEval.score : 0;
    const fieldScore = fieldSupervisorEval ? fieldSupervisorEval.score : 0;
    
    // Apply the weighting: 60% academic + 40% field
    return (academicScore * 0.6) + (fieldScore * 0.4);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mahasiswa</TableHead>
            <TableHead>NIM</TableHead>
            <TableHead>Nilai Pembimbing</TableHead>
            <TableHead>Nilai Pembimbing Lapangan</TableHead>
            <TableHead>Nilai Akhir</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(groupedEvaluations).map(([studentId, studentEvaluations]) => {
            const supervisorEval = studentEvaluations.find(e => e.evaluator_type === 'supervisor');
            const fieldSupervisorEval = studentEvaluations.find(e => e.evaluator_type === 'field_supervisor');
            const finalScore = calculateFinalScore(studentEvaluations);
            const student = studentEvaluations[0]?.student;
            
            return (
              <TableRow key={studentId}>
                <TableCell>{student?.full_name || 'Unknown'}</TableCell>
                <TableCell>{student?.nim || 'N/A'}</TableCell>
                <TableCell>{supervisorEval?.score?.toFixed(1) || '-'}</TableCell>
                <TableCell>{fieldSupervisorEval?.score?.toFixed(1) || '-'}</TableCell>
                <TableCell className="font-medium">{finalScore.toFixed(1)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(studentId)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(studentId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          
          {Object.keys(groupedEvaluations).length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                Belum ada data penilaian
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {selectedEvaluation && (
        <>
          <EditEvaluationDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            evaluation={selectedEvaluation}
            onSave={onEditEvaluation}
          />
          <DeleteEvaluationDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            evaluation={selectedEvaluation}
            onDelete={() => {
              onDeleteEvaluation(selectedEvaluation.id);
              setDeleteDialogOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
};

export default EvaluationTable;
