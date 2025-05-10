
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
import { Evaluation } from '@/services/evaluationService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeleteEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluation: Evaluation;
  onDelete: (id: string) => void;
}

const DeleteEvaluationDialog = ({
  open,
  onOpenChange,
  evaluation,
  onDelete
}: DeleteEvaluationDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', evaluation.id);
      
      if (error) throw error;
      
      onDelete(evaluation.id);
      onOpenChange(false);
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
            Yakin ingin menghapus penilaian {evaluation?.evaluator_type === 'supervisor' 
              ? 'Pembimbing Akademik' 
              : 'Pembimbing Lapangan'} untuk {evaluation?.student?.full_name}?
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
