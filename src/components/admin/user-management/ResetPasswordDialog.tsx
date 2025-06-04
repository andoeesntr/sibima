
import { useState } from 'react';
import { toast } from 'sonner';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserData } from './types';

interface ResetPasswordDialogProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ResetPasswordDialog = ({ user, isOpen, onClose }: ResetPasswordDialogProps) => {
  const [newPassword, setNewPassword] = useState('');
  
  const handleResetPasswordSubmit = async () => {
    if (!user || !newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    try {
      // In a real application, you would call an API or Edge Function to reset the password
      toast.success(`Password reset functionality would be implemented with a Supabase Edge Function`);
      onClose();
      setNewPassword('');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(`Failed to reset password: ${error.message}`);
    }
  };
  
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogDescription>
          Masukkan password baru untuk {user?.name || user?.email}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="new-password">Password Baru</Label>
          <Input 
            id="new-password" 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Masukkan password baru" 
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button 
            onClick={handleResetPasswordSubmit}
            className="bg-primary hover:bg-primary/90"
          >
            Reset Password
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
};
