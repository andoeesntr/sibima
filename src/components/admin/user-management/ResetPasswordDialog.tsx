
import { useState } from 'react';
import { toast } from 'sonner';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { UserData } from './types';

interface ResetPasswordDialogProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ResetPasswordDialog = ({ user, isOpen, onClose }: ResetPasswordDialogProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleResetPasswordSubmit = async () => {
    if (!user || !newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: {
          userId: user.id,
          newPassword: newPassword
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success(`Password untuk ${user.name || user.email} berhasil direset`);
      onClose();
      setNewPassword('');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(`Failed to reset password: ${error.message}`);
    } finally {
      setIsLoading(false);
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
            placeholder="Masukkan password baru (minimal 6 karakter)" 
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button 
            onClick={handleResetPasswordSubmit}
            className="bg-primary hover:bg-primary/90"
            disabled={isLoading || !newPassword || newPassword.length < 6}
          >
            {isLoading ? 'Mereset...' : 'Reset Password'}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
};
