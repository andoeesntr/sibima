
export interface Profile {
  id: string;
  full_name?: string;
  role: 'student' | 'supervisor' | 'coordinator' | 'admin';
  nim?: string;
  nid?: string;
  faculty?: string;
  department?: string;
  profile_image?: string;
  email?: string;
}

export interface AuthContextType {
  user: any;
  profile: Profile | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}
