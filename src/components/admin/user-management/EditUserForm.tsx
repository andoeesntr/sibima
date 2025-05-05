
import { useState } from 'react';
import { toast } from 'sonner';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { UserData } from './types';

interface EditUserFormProps {
  user: UserData;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditUserForm = ({ user, onClose, onSuccess }: EditUserFormProps) => {
  // Create independent state variables to avoid manipulation of original user data
  const [name, setName] = useState(user.name || '');
  const [role, setRole] = useState<UserRole>(user.role);
  const [nim, setNim] = useState(user.nim || '');
  const [nip, setNip] = useState(user.nip || '');
  const [faculty, setFaculty] = useState(user.faculty || '');
  const [department, setDepartment] = useState(user.department || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!name || !role) {
      toast.error('Harap isi semua bidang yang diperlukan');
      return;
    }
    
    // Validate student specific fields
    if (role === 'student' && !nim) {
      toast.error('NIM diperlukan untuk mahasiswa');
      return;
    }
    
    // Validate supervisor specific fields
    if (role === 'supervisor' && !nip) {
      toast.error('NIP diperlukan untuk dosen');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Updating user with ID:", user.id, "to role:", role);
      
      // Use the edge function to update the user with service role permissions
      const { error } = await supabase.functions.invoke('update-user', {
        body: {
          userId: user.id,
          userData: {
            full_name: name,
            role,
            nim: role === 'student' ? nim : null,
            nip: role === 'supervisor' ? nip : null,
            faculty: role === 'student' ? faculty : null,
            department: role === 'student' || role === 'supervisor' ? department : null
          }
        }
      });
        
      if (error) throw error;
      
      toast.success('Pengguna berhasil diperbarui');
      
      // Close the dialog before refreshing data to prevent freezing
      onClose();
      
      // After closing the dialog, refresh data
      await onSuccess();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(`Failed to update user: ${error.message}`);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="edit-role">Role</Label>
        <Select
          value={role}
          onValueChange={(value) => {
            console.log("Setting role to:", value);
            setRole(value as UserRole);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Mahasiswa</SelectItem>
            <SelectItem value="supervisor">Dosen</SelectItem>
            <SelectItem value="coordinator">Koordinator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="edit-name">Nama Lengkap</Label>
        <Input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama lengkap"
        />
      </div>
      
      {role === 'student' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="edit-nim">NIM</Label>
            <Input
              id="edit-nim"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              placeholder="Masukkan NIM"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-faculty">Fakultas</Label>
              <Input
                id="edit-faculty"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="Masukkan fakultas"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-department">Program Studi</Label>
              <Input
                id="edit-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Masukkan program studi"
              />
            </div>
          </div>
        </>
      )}
      
      {role === 'supervisor' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="edit-nip">NIP</Label>
            <Input
              id="edit-nip"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="Masukkan NIP"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-department">Department</Label>
            <Input
              id="edit-department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Masukkan department"
            />
          </div>
        </>
      )}
      
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Batal
        </Button>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </DialogFooter>
    </div>
  );
};
