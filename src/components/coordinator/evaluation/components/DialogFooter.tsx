
import { Button } from "@/components/ui/button";

interface DialogFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isDisabled: boolean;
}

const DialogFooter = ({
  onCancel,
  onSubmit,
  isSubmitting,
  isDisabled
}: DialogFooterProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Batal
      </Button>
      <Button 
        onClick={onSubmit}
        disabled={isSubmitting || isDisabled}
      >
        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
      </Button>
    </div>
  );
};

export default DialogFooter;
