
import { supabase } from '@/integrations/supabase/client';

export const registerUser = async (userData: {
  email: string;
  password: string;
  full_name?: string;
  nim?: string;
  nip?: string;
  faculty?: string;
  department?: string;
  role: 'student' | 'coordinator' | 'admin' | 'supervisor';
}) => {
  try {
    // Use the invoke method to call the edge function
    const { data, error } = await supabase.functions.invoke('register', {
      body: userData
    });

    if (error) {
      console.error("Registration function error:", error);
      throw new Error(error.message || 'Registration failed');
    }

    if (!data) {
      throw new Error('Registration failed: No data returned');
    }

    return data;
  } catch (error: any) {
    console.error("Registration error:", error);
    throw new Error(`Registration error: ${error.message}`);
  }
};
