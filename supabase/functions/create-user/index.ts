
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

type CreateUserData = {
  email: string;
  password: string;
  full_name?: string;
  nim?: string;
  nid?: string;  // Using nid instead of nip
  faculty?: string;
  department?: string;
  role: 'student' | 'coordinator' | 'admin' | 'supervisor';
}

serve(async (req) => {
  // This is necessary for CORS to work
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    // Create the admin client properly
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    const { email, password, full_name, role, nim, nid, faculty, department } = await req.json() as CreateUserData

    if (!email || !password || !role) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Email, password, and role are required' 
        }), 
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    console.log("Attempting to create user with role:", role, "email:", email)

    // First, check if email already exists in profiles
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingProfile) {
      console.error("Email already in use:", email);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Email already in use' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    // Create user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    })

    if (authError) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: authError.message 
        }), 
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    if (!authData.user) {
      console.error("No user created");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to create user' 
        }), 
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    console.log("Auth user created successfully:", authData.user.id, "with role:", role);

    // Create profile data object
    const profileData = {
      id: authData.user.id,
      email: email,
      full_name: full_name,
      role: role,
      nim: role === 'student' ? nim : null,
      nid: role === 'supervisor' ? nid : null,  // Using nid instead of nip
      faculty: faculty,
      department: department
    }
    
    console.log("Creating profile with data:", profileData);

    // Update the profile with additional data
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profileData)
      .eq('id', authData.user.id)

    if (profileError) {
      console.error("Profile creation error:", profileError);
      
      // If profile update fails, delete the user
      try {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        if (deleteError) {
          console.error("Error deleting user after profile creation failure:", deleteError);
        }
      } catch (deleteError) {
        console.error("Error during user cleanup:", deleteError);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Profile creation failed: ${profileError.message}` 
        }), 
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    console.log("Profile created successfully for user:", authData.user.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'User created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: role
        }
      }), 
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  } catch (error) {
    console.error("Error in create-user function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` 
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  }
})
