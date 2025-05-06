
import { UserRole } from '@/types';

export interface UserData {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  nim?: string;
  nip?: string; // We're keeping this for now as it's used across components but treated as 'nid'
  faculty?: string;
  department?: string;
}
