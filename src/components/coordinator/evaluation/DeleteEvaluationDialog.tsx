
import { useState } from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { deleteEvaluation } from '@/services/evaluationService';
import { toast } from 'sonner';

interface DeleteEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluationId: string;
  studentName: string;
  onDelete: () => void;
}

const DeleteEvaluationDialog = ({
  open,
  onOpenChange,
  evaluationId,
  studentName,
  onDelete
}: DeleteEvaluationDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteEvaluation(evaluationId);
      
      if (success) {
        onDelete();
        onOpenChange(false);
      } else {
        throw new Error('Failed to delete evaluation');
      }
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      toast.error('Failed to delete evaluation');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Penilaian</AlertDialogTitle>
          <AlertDialogDescription>
            Yakin ingin menghapus penilaian untuk {studentName}?
            <br />
            Tindakan ini tidak dapat diurungkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteEvaluationDialog;
