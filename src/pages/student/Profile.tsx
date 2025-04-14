import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ProfileImageUploader from '@/components/ProfileImageUploader';

const StudentProfile = () => {
  const { profile, user, updateProfile } = useAuth();
  
  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Update state when profile or user data changes
    if (profile) {
      setName(profile.full_name || '');
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);
  
  const handleUpdateProfile = async () => {
    if (!user) {
      toast.error('Anda harus login untuk memperbarui profil');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await updateProfile({
        full_name: name
      });
      
      toast.success('Profil berhasil diperbarui');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`Gagal memperbarui profil: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    
    if (!currentPassword) {
      toast.error('Password saat ini diperlukan');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });
      
      if (signInError) {
        toast.error('Password saat ini tidak valid');
        setIsLoading(false);
        return;
      }
      
      // Then update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password berhasil diperbarui');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(`Gagal memperbarui password: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
        <ProfileImageUploader initialImage={profile?.profile_image} />
        <div>
          <h1 className="text-2xl font-bold">{profile?.full_name || 'Mahasiswa'}</h1>
          <p className="text-gray-600">{profile?.nim || 'No NIM'} - Mahasiswa</p>
        </div>
      </div>
      
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="security">Keamanan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>
                Perbarui informasi profil Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nim">NIM</Label>
                <Input id="nim" value={profile?.nim || ''} disabled />
                <p className="text-sm text-gray-500">
                  NIM tidak dapat diubah
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  disabled
                />
                <p className="text-sm text-gray-500">
                  Email tidak dapat diubah
                </p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="faculty">Fakultas</Label>
                  <Input id="faculty" value={profile?.faculty || ''} disabled />
                </div>
                <div>
                  <Label htmlFor="department">Program Studi</Label>
                  <Input id="department" value={profile?.department || ''} disabled />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleUpdateProfile}
                className="ml-auto bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Memperbarui...' : 'Perbarui Profil'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Ubah Password</CardTitle>
              <CardDescription>
                Perbarui password akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Password Saat Ini</Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleChangePassword}
                className="ml-auto bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Memperbarui...' : 'Ubah Password'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentProfile;
