
import { useState } from 'react';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Evaluation, deleteEvaluation 
} from '@/services/evaluationService';

interface EvaluationTableProps {
  evaluations: Evaluation[];
  loading: boolean;
  onEdit: (evaluation: Evaluation) => void;
  onRefresh: () => void;
}

const EvaluationTable = ({ 
  evaluations, 
  loading, 
  onEdit, 
  onRefresh 
}: EvaluationTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<Evaluation | null>(null);

  const handleDelete = async () => {
    if (!evaluationToDelete) return;
    
    try {
      const success = await deleteEvaluation(evaluationToDelete.id);
      if (success) {
        toast.success('Penilaian berhasil dihapus');
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      toast.error('Gagal menghapus penilaian');
    } finally {
      setDeleteDialogOpen(false);
      setEvaluationToDelete(null);
    }
  };
  
  const openDeleteDialog = (evaluation: Evaluation) => {
    setEvaluationToDelete(evaluation);
    setDeleteDialogOpen(true);
  };
  
  // Group evaluations by student_id
  const groupedEvaluations = evaluations.reduce((acc, evaluation) => {
    if (!acc[evaluation.student_id]) {
      acc[evaluation.student_id] = [];
    }
    acc[evaluation.student_id].push(evaluation);
    return acc;
  }, {} as Record<string, Evaluation[]>);
  
  // Calculate final scores
  const studentScores = Object.keys(groupedEvaluations).map(studentId => {
    const studentEvals = groupedEvaluations[studentId];
    const student = studentEvals[0]?.student;
    
    // Get supervisor score (academic supervisor)
    const supervisorEval = studentEvals.find(e => e.evaluator_type === 'supervisor');
    const supervisorScore = supervisorEval?.score || 0;
    
    // Get field supervisor score
    const fieldSupervisorEval = studentEvals.find(e => e.evaluator_type === 'field_supervisor');
    const fieldSupervisorScore = fieldSupervisorEval?.score || 0;
    
    // Calculate final score
    const finalScore = (supervisorScore * 0.6) + (fieldSupervisorScore * 0.4);
    
    return {
      studentId,
      studentName: student?.full_name || 'Unknown',
      studentNim: student?.nim || '-',
      supervisorScore,
      fieldSupervisorScore,
      finalScore: parseFloat(finalScore.toFixed(2)),
      supervisorEval,
      fieldSupervisorEval,
      hasFullEvaluation: supervisorScore > 0 && fieldSupervisorScore > 0
    };
  });

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Belum ada data penilaian.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableCaption>Daftar penilaian mahasiswa KP</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>NIM</TableHead>
            <TableHead>Nama Mahasiswa</TableHead>
            <TableHead className="text-center">Nilai Pembimbing Akademik (60%)</TableHead>
            <TableHead className="text-center">Nilai Pembimbing Lapangan (40%)</TableHead>
            <TableHead className="text-center">Nilai Akhir</TableHead>
            <TableHead className="w-[100px] text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studentScores.map((score) => (
            <TableRow key={score.studentId}>
              <TableCell className="font-medium">{score.studentNim}</TableCell>
              <TableCell>{score.studentName}</TableCell>
              <TableCell className="text-center">
                {score.supervisorScore || '-'}
              </TableCell>
              <TableCell className="text-center">
                {score.fieldSupervisorScore || '-'}
              </TableCell>
              <TableCell className="text-center font-bold">{score.finalScore}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {score.supervisorEval && (
                      <DropdownMenuItem onClick={() => onEdit(score.supervisorEval!)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Nilai Akademik
                      </DropdownMenuItem>
                    )}
                    {score.fieldSupervisorEval && (
                      <DropdownMenuItem onClick={() => onEdit(score.fieldSupervisorEval!)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Nilai Lapangan
                      </DropdownMenuItem>
                    )}
                    {(score.supervisorEval || score.fieldSupervisorEval) && (
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(score.supervisorEval || score.fieldSupervisorEval!)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus Nilai
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => !open && setDeleteDialogOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus penilaian ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EvaluationTable;
