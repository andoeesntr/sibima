
import { supabase } from '@/integrations/supabase/client';

export const registerUser = async (userData: {
  email: string;
  password: string;
  full_name?: string;
  nim?: string;
  nid?: string; // Changed from nip to nid
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

// New function to handle creating users via admin panel
export const createUser = async (userData: {
  email: string;
  password: string;
  full_name?: string;
  nim?: string;
  nid?: string;
  faculty?: string;
  department?: string;
  role: 'student' | 'coordinator' | 'admin' | 'supervisor';
}) => {
  try {
    console.log("Creating user with data:", userData);
    // Use the invoke method to call the edge function
    const response = await supabase.functions.invoke('create-user', {
      body: userData
    });
    
    const { data, error } = response;
    
    if (error) {
      console.error("Edge function error:", error);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data || data.success === false) {
      console.error("Failed response from create-user function:", data);
      throw new Error(data?.error || "Failed to create user");
    }
    
    return data;
  } catch (error: any) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// New function to handle login with email or NIM/NID
export const loginUser = async (identifier: string, password: string) => {
  try {
    // Check if the identifier is an email (contains @)
    if (identifier.includes('@')) {
      // Login with email
      return await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });
    } else {
      // Identifier is not an email, so it could be a NIM or NID
      // First, try to find the user by NIM or NID to get their email
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .or(`nim.eq.${identifier},nid.eq.${identifier}`)
        .single();

      if (profileError || !profileData) {
        console.error("User lookup error:", profileError);
        throw new Error('No user found with that NIM/NID');
      }

      // Once we have the email, use it to authenticate
      return await supabase.auth.signInWithPassword({
        email: profileData.email,
        password,
      });
    }
  } catch (error: any) {
    console.error("Login error:", error);
    throw new Error(`Login error: ${error.message}`);
  }
};
