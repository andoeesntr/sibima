
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Evaluation } from '@/services/evaluationService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EditEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluation: Evaluation;
  onSave: (evaluation: Evaluation) => void;
}

const EditEvaluationDialog = ({
  open,
  onOpenChange,
  evaluation,
  onSave
}: EditEvaluationDialogProps) => {
  const [score, setScore] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (evaluation) {
      setScore(evaluation.score.toString());
      setComments(evaluation.comments || '');
    }
  }, [evaluation, open]);
  
  const handleSubmit = async () => {
    if (!score) {
      toast.error('Nilai harus diisi');
      return;
    }
    
    const numScore = parseFloat(score);
    
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      toast.error('Nilai harus berupa angka antara 0-100');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .update({
          score: numScore,
          comments: comments
        })
        .eq('id', evaluation.id)
        .select()
        .single();
      
      if (error) throw error;
      
      onSave({
        ...evaluation,
        score: numScore,
        comments: comments
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating evaluation:', error);
      toast.error('Failed to update evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Nilai</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label className="font-bold">Mahasiswa</Label>
            <p className="text-gray-700 mt-1">{evaluation?.student?.full_name}</p>
          </div>
          
          <div>
            <Label className="font-bold">Jenis Penilaian</Label>
            <p className="text-gray-700 mt-1">
              {evaluation?.evaluator_type === 'supervisor' 
                ? 'Pembimbing Akademik' 
                : 'Pembimbing Lapangan'}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="score">Nilai (0-100)</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comments">Catatan</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !score}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEvaluationDialog;
