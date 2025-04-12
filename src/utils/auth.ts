
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
    const response = await fetch(`https://ciaymvntmwwbnvewedue.supabase.co/functions/v1/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.auth.session()?.access_token}`
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  } catch (error: any) {
    throw new Error(`Registration error: ${error.message}`);
  }
};
