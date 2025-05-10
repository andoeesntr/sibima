
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
            {evaluations.map((evaluation) => {
              let finalGrade = evaluation.score;
              
              return (
                <TableRow key={evaluation.id}>
                  <TableCell className="font-medium">
                    {evaluation.student?.full_name || 'Unknown Student'}
                  </TableCell>
                  <TableCell>
                    {evaluation.evaluator_type === 'supervisor' ? evaluation.score : '-'}
                  </TableCell>
                  <TableCell>
                    {evaluation.evaluator_type === 'field_supervisor' ? evaluation.score : '-'}
                  </TableCell>
                  <TableCell>{finalGrade}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(evaluation)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteClick(evaluation)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
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
