
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { UserSearchHeader } from '@/components/admin/user-management/UserSearchHeader';
import { UserTable } from '@/components/admin/user-management/UserTable';
import { AddUserForm } from '@/components/admin/user-management/AddUserForm';
import { EditUserForm } from '@/components/admin/user-management/EditUserForm';
import { ResetPasswordDialog } from '@/components/admin/user-management/ResetPasswordDialog';
import { UserData } from '@/components/admin/user-management/types';

type UserTab = 'all' | 'student' | 'supervisor' | 'admin' | 'coordinator';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState<UserTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, nim, nid, faculty, department');
      
      if (error) {
        throw error;
      }

      // Transform data to match our UserData interface
      // Here we map nid to nip for backward compatibility
      const transformedUsers = data.map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Unnamed User',
        email: profile.email,
        role: profile.role as UserRole,
        nim: profile.nim,
        nip: profile.nid, // Map nid from database to nip for interface compatibility
        faculty: profile.faculty,
        department: profile.department
      }));
      
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredUsers = users.filter(user => {
    // Filter by tab
    if (activeTab !== 'all' && user.role !== activeTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      return (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
             user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    return true;
  });
  
  const roleLabels: Record<UserRole, string> = {
    student: 'Mahasiswa',
    supervisor: 'Dosen',
    coordinator: 'Koordinator',
    admin: 'Admin',
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      console.log("Attempting to delete user:", userId);
      
      // First delete the profile - this is the important step that was missing
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error('Error deleting user profile:', profileError);
        throw profileError;
      }
      
      // Then use the admin API to delete the auth user
      // Note: This will likely require a function with service_role key
      const { error: authError } = await supabase.functions.invoke('delete-user', {
        body: { userId },
      });
      
      if (authError) {
        console.error('Error in delete-user function:', authError);
        throw authError;
      }
      
      setUsers(users.filter(user => user.id !== userId));
      toast.success(`User ${userName} berhasil dihapus`);
      
      // Force refresh to ensure accurate data
      await fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error.message}`);
    }
  };

  const handleEditUser = (userData: UserData) => {
    setEditingUser(userData);
    setIsEditDialogOpen(true);
  };

  const handleResetPassword = (userId: string) => {
    setEditingUser(users.find(user => user.id === userId) || null);
    setIsResetPasswordDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <UserSearchHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        fetchUsers={fetchUsers}
      />
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as UserTab)}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="student">Mahasiswa</TabsTrigger>
          <TabsTrigger value="supervisor">Dosen</TabsTrigger>
          <TabsTrigger value="coordinator">Koordinator</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pengguna</CardTitle>
            <CardDescription>
              {activeTab === 'all' ? 'Semua pengguna' : `Pengguna dengan role ${roleLabels[activeTab as UserRole]}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserTable 
              users={filteredUsers} 
              isLoading={isLoading} 
              roleLabels={roleLabels} 
              handleEditUser={handleEditUser}
              handleResetPassword={handleResetPassword}
              handleDeleteUser={handleDeleteUser}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-gray-600">
              Menampilkan {filteredUsers.length} pengguna
            </div>
          </CardFooter>
        </Card>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <AddUserForm 
            onClose={() => setIsAddDialogOpen(false)} 
            onSuccess={fetchUsers} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {editingUser && (
          <DialogContent>
            <EditUserForm 
              user={editingUser} 
              onClose={() => setIsEditDialogOpen(false)} 
              onSuccess={fetchUsers} 
            />
          </DialogContent>
        )}
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <ResetPasswordDialog 
          user={editingUser} 
          isOpen={isResetPasswordDialogOpen} 
          onClose={() => setIsResetPasswordDialogOpen(false)} 
        />
      </Dialog>
    </div>
  );
};

export default UserManagement;
