
import { useState } from 'react';
import { toast } from 'sonner';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserRole } from '@/types';
import { createUser } from '@/utils/auth';

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
  const [nid, setNid] = useState('');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation function for numeric input
  const handleNumericInput = (value: string, setter: (value: string) => void) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setter(numericValue);
  };

  const handleSubmit = async () => {
    // Validation checks
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
    if (role === 'supervisor' && !nid) {
      toast.error('NID diperlukan untuk dosen');
      return;
    }

    // Additional validation for numeric fields
    if (role === 'student' && nim && !/^\d+$/.test(nim)) {
      toast.error('NIM harus berupa angka saja');
      return;
    }

    if (role === 'supervisor' && nid && !/^\d+$/.test(nid)) {
      toast.error('NID harus berupa angka saja');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log(`Adding user with role: ${role}, email: ${email}`);
      
      // Use our createUser function to create a new user with proper permissions
      const result = await createUser({
        email,
        password,
        full_name: name,
        role,
        nim: role === 'student' ? nim : undefined,
        nid: role === 'supervisor' ? nid : undefined,
        faculty: role === 'student' ? faculty : undefined,
        department: role === 'student' || role === 'supervisor' ? department : undefined
      });
      
      console.log("User created successfully:", result);
      
      toast.success('Pengguna berhasil ditambahkan');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding user:', error);
      
      // More descriptive error message
      let errorMessage = 'Gagal menambahkan pengguna';
      if (error.message && error.message.includes('Email already in use')) {
        errorMessage = `Email ${email} sudah digunakan. Gunakan email lain.`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-4 py-2">
      <DialogHeader>
        <DialogTitle>Tambah Pengguna Baru</DialogTitle>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={role}
          onValueChange={(value) => {
            console.log("Role selected:", value);
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
              onChange={(e) => handleNumericInput(e.target.value, setNim)}
              placeholder="Masukkan NIM (angka saja)"
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
            <Label htmlFor="nid">NID</Label>
            <Input
              id="nid"
              value={nid}
              onChange={(e) => handleNumericInput(e.target.value, setNid)}
              placeholder="Masukkan NID (angka saja)"
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
