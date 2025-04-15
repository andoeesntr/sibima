
import { useState } from 'react';
import { Upload, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileImageUploaderProps {
  initialImage?: string | null;
  onImageUpdate?: (url: string) => void;
}

const ProfileImageUploader = ({ 
  initialImage, 
  onImageUpdate 
}: ProfileImageUploaderProps) => {
  const { user, profile, updateProfile } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(initialImage || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image file size should be less than 2MB');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Generate file path with user ID as folder
      const fileName = `${new Date().getTime()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload file
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload image: ' + uploadError.message);
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      console.log('Image uploaded successfully. Public URL:', publicUrl);
      
      // Update state
      setImageUrl(publicUrl);
      
      // Update profile
      if (profile) {
        await updateProfile({
          profile_image: publicUrl
        });
      }
      
      // Call callback
      if (onImageUpdate) {
        onImageUpdate(publicUrl);
      }
      
      toast.success('Profile image updated successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const fallbackText = profile?.full_name 
    ? profile.full_name.charAt(0).toUpperCase()
    : (profile?.role?.charAt(0).toUpperCase() || 'U');

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-primary/20 overflow-hidden">
          <AvatarImage 
            src={imageUrl || undefined} 
            alt="Profile" 
            className="object-cover w-full h-full"
          />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {fallbackText}
          </AvatarFallback>
        </Avatar>
        
        <div className="absolute -right-2 -bottom-2">
          <Label 
            htmlFor="profile-image-upload" 
            className="bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors flex items-center justify-center w-8 h-8"
          >
            {isUploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
            ) : (
              <Upload size={16} />
            )}
          </Label>
          
          <input 
            type="file" 
            id="profile-image-upload" 
            accept="image/*"
            className="sr-only"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        </div>
      </div>
      
      <p className="text-sm text-gray-500">
        Click the icon to upload your profile picture
      </p>
    </div>
  );
};

export default ProfileImageUploader;
