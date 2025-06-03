
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import ProfileImageUploader from '@/components/ProfileImageUploader';

const CoordinatorProfile = () => {
  const { profile, user, updateProfile } = useAuth();
  
  // State for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Debug info
  console.log("Profile data in CoordinatorProfile:", profile);
  console.log("User data in CoordinatorProfile:", user);
  
  // Update state when profile or user data changes
  useEffect(() => {
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
  
  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    
    if (!currentPassword) {
      toast.error('Password saat ini diperlukan');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password berhasil diperbarui');
    }, 1000);
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <ProfileImageUploader initialImage={profile?.profile_image} />
        <div>
          <h1 className="text-2xl font-bold">{profile?.full_name || 'Koordinator KP'}</h1>
          <p className="text-gray-600">Koordinator KP</p>
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
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={user?.email?.split('@')[0] || ''} disabled />
                <p className="text-sm text-gray-500">
                  Username tidak dapat diubah
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

export default CoordinatorProfile;
