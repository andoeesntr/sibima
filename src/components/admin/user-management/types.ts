
import { UserRole } from '@/types';

export interface UserData {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  nim?: string;
  nip?: string;
  faculty?: string;
  department?: string;
  profile_image?: string | null; // tambahkan field gambar profile
}
