
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, Key, MoreHorizontal, Pencil, PlusCircle, Search, Trash, User, UserCog, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { students, supervisors, users } from '@/services/mockData';
import { UserRole } from '@/types';

type UserTab = 'all' | 'student' | 'supervisor' | 'admin';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState<UserTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const allUsers = [...students, ...supervisors, ...users];
  
  const filteredUsers = allUsers.filter(user => {
    // Filter by tab
    if (activeTab !== 'all' && user.role !== activeTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      return user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             user.email.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  });
  
  const roleLabels: Record<UserRole, string> = {
    student: 'Mahasiswa',
    supervisor: 'Dosen',
    coordinator: 'Koordinator',
    admin: 'Admin',
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    toast.success(`User ${userName} berhasil dihapus`);
  };

  const handleEditUser = (userId: string) => {
    toast.info(`Edit user dengan ID ${userId}`);
  };

  const handleResetPassword = (userId: string, userName: string) => {
    toast.success(`Password untuk ${userName} berhasil direset`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
          <p className="text-gray-600">Kelola semua pengguna dalam sistem</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Input
              placeholder="Cari pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <PlusCircle size={16} className="mr-1" /> Tambah
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                <DialogDescription>
                  Isi formulir berikut untuk menambahkan pengguna baru
                </DialogDescription>
              </DialogHeader>
              <AddUserForm onClose={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as UserTab)}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="student">Mahasiswa</TabsTrigger>
          <TabsTrigger value="supervisor">Dosen</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pengguna</CardTitle>
            <CardDescription>
              {activeTab === 'all' ? 'Semua pengguna' : `Pengguna dengan role ${roleLabels[activeTab]}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <Avatar>
                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">
                                {user.role === 'student' && 
                                  ('nim' in user ? user.nim : '')}
                                {user.role === 'supervisor' && 
                                  ('nip' in user ? user.nip : '')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={
                            user.role === 'admin' ? 'bg-purple-500' :
                            user.role === 'supervisor' ? 'bg-blue-500' :
                            user.role === 'coordinator' ? 'bg-orange-500' :
                            'bg-green-500'
                          }>
                            {roleLabels[user.role]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal size={16} />
                                <span className="sr-only">Action</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                                <Pencil size={14} className="mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResetPassword(user.id, user.name)}>
                                <Key size={14} className="mr-2" /> Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user.id, user.name)}
                              >
                                <Trash size={14} className="mr-2" /> Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        <Users className="mx-auto h-10 w-10 opacity-30 mb-2" />
                        <p>Tidak ada pengguna yang ditemukan</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-gray-600">
              Menampilkan {filteredUsers.length} pengguna
            </div>
          </CardFooter>
        </Card>
      </Tabs>
    </div>
  );
};

// Add User Form Component
const AddUserForm = ({ onClose }: { onClose: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [nim, setNim] = useState('');
  const [nip, setNip] = useState('');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = () => {
    if (!name || !email || !role) {
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
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Pengguna berhasil ditambahkan');
      onClose();
    }, 1000);
  };
  
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={role}
          onValueChange={(value) => setRole(value as UserRole)}
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

// Avatar Component
const Avatar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
      {children}
    </div>
  );
};

// Avatar Fallback Component
const AvatarFallback = ({ children }: { children: React.ReactNode }) => {
  return <div className="font-medium text-lg">{children}</div>;
};

export default UserManagement;
