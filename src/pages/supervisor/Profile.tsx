
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, FileSignature } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ProfileImageUploader from '@/components/ProfileImageUploader';

const SupervisorProfile = () => {
  const { profile, user, updateProfile } = useAuth();
  
  // State for form fields
  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasDigitalSignature, setHasDigitalSignature] = useState(false);
  
  // Update state when profile or user data changes
  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '');
      setDepartment(profile.department || '');
    }
    if (user) {
      setEmail(user.email || '');
    }
    
    // Check if the supervisor has a digital signature
    const checkSignature = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('digital_signatures')
          .select('id')
          .eq('supervisor_id', user.id)
          .maybeSingle();
          
        if (!error && data) {
          setHasDigitalSignature(true);
        }
      } catch (error) {
        console.error('Error checking digital signature:', error);
      }
    };
    
    checkSignature();
  }, [profile, user]);
  
  const handleUpdateProfile = async () => {
    if (!user) {
      toast.error('Anda harus login untuk memperbarui profil');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await updateProfile({
        full_name: name,
        department: department
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
          <h1 className="text-2xl font-bold">{profile?.full_name || 'Dosen Pembimbing'}</h1>
          <p className="text-gray-600">{profile?.nip || 'No NIP'} - Dosen Pembimbing KP</p>
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
                <Label htmlFor="nip">NIP</Label>
                <Input id="nip" value={profile?.nip || ''} disabled />
                <p className="text-sm text-gray-500">
                  NIP tidak dapat diubah
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
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input 
                  id="department" 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                <FileSignature className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Status Tanda Tangan Digital</p>
                  <div className="flex items-center mt-1">
                    {hasDigitalSignature ? (
                      <Badge className="bg-green-500">Tersedia</Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
                        Belum Tersedia
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {!hasDigitalSignature && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Perhatian</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Anda belum mengupload tanda tangan digital. Silakan upload tanda tangan digital
                    Anda untuk digunakan dalam proses validasi dokumen KP mahasiswa.
                  </AlertDescription>
                </Alert>
              )}
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

export default SupervisorProfile;
