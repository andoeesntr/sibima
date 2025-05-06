
import { useState } from 'react';
import { toast } from 'sonner';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface AddUserFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddUserForm = ({ onClose, onSuccess }: AddUserFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [nim, setNim] = useState('');
  const [nid, setNid] = useState(''); // Changed from nip to nid
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!name || !email || !role || !password) {
      toast.error('Harap isi semua bidang yang diperlukan');
      return;
    }
    
    // Validate student specific fields
    if (role === 'student' && !nim) {
      toast.error('NIM diperlukan untuk mahasiswa');
      return;
    }
    
    // Validate supervisor specific fields
    if (role === 'supervisor' && !nid) { // Changed from nip to nid
      toast.error('NID diperlukan untuk dosen'); // Changed from NIP to NID
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Adding user with role:", role);
      
      // Use our edge function to create a new user with proper permissions
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email,
          password,
          full_name: name,
          role,
          nim: role === 'student' ? nim : null,
          nid: role === 'supervisor' ? nid : null, // Changed from nip to nid
          faculty: role === 'student' ? faculty : null,
          department: role === 'student' || role === 'supervisor' ? department : null
        }
      });
      
      if (error) throw error;
      
      console.log("User created successfully:", data);
      
      toast.success('Pengguna berhasil ditambahkan');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error(`Failed to add user: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={role}
          onValueChange={(value) => {
            console.log("Role selected:", value); // Debug log
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
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama lengkap"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan alamat email"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Masukkan password"
        />
      </div>
      
      {role === 'student' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="nim">NIM</Label>
            <Input
              id="nim"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              placeholder="Masukkan NIM"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="faculty">Fakultas</Label>
              <Input
                id="faculty"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="Masukkan fakultas"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Program Studi</Label>
              <Input
                id="department"
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
            {/* Changed from nip to nid */}
            <Label htmlFor="nid">NID</Label>
            <Input
              id="nid"
              value={nid}
              onChange={(e) => setNid(e.target.value)}
              placeholder="Masukkan NID"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
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
          {isSubmitting ? 'Menyimpan...' : 'Tambah Pengguna'}
        </Button>
      </DialogFooter>
    </div>
  );
};
