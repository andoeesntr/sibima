
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
  const [nip, setNip] = useState('');
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
    if (role === 'supervisor' && !nip) {
      toast.error('NIP diperlukan untuk dosen');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Adding user with role:", role); // Debug log
      
      // First sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role // Store role in user metadata
          }
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('User registration failed');
      }
      
      console.log("Auth user created:", authData.user.id, "with role:", role); // Debug log
      
      // Explicitly create profile with the correct role
      const profileData = {
        id: authData.user.id,
        email: email,
        full_name: name,
        role: role
      };
      
      // Add role-specific fields to profile data
      if (role === 'student') {
        Object.assign(profileData, {
          nim: nim,
          faculty: faculty,
          department: department,
          nip: null
        });
      } else if (role === 'supervisor') {
        Object.assign(profileData, {
          nip: nip,
          department: department,
          nim: null,
          faculty: null
        });
      } else {
        // For other roles, set fields to null
        Object.assign(profileData, {
          nim: null,
          nip: null,
          faculty: null,
          department: null
        });
      }
      
      console.log("Creating profile with data:", profileData); // Debug log
      
      // Insert the new profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);
        
      if (profileError) throw profileError;
      
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
            <Label htmlFor="nip">NIP</Label>
            <Input
              id="nip"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="Masukkan NIP"
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
