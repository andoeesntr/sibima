
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Get the request body
    const { email, password, full_name, role, nim, nid, faculty, department } = await req.json();

    // Validate required fields
    if (!email || !password || !full_name || !role) {
      throw new Error("Required fields missing: email, password, full_name, and role are required");
    }

    console.log(`Attempting to create user with role: ${role}, email: ${email}`);

    // Create a Supabase client with the service role key (to bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if the email already exists in the profiles table
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (profileCheckError) {
      console.error("Error checking for existing profile:", profileCheckError);
      throw profileCheckError;
    }

    if (existingProfile) {
      console.error("Email already exists in profiles table:", email);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Email already in use: ${email}`
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Check if the email already exists in auth.users
    const { data: existingUsers, error: authCheckError } = await supabaseAdmin.auth.admin.listUsers();
    if (authCheckError) {
      console.error("Error checking for existing auth users:", authCheckError);
      throw authCheckError;
    }

    const emailExists = existingUsers.users.some(user => user.email === email);
    if (emailExists) {
      console.error("Email already exists in auth.users:", email);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Email already in use: ${email}`
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // 1. Create the user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification
      user_metadata: {
        full_name,
        role
      }
    });

    if (authError) {
      console.error("Auth user creation error:", authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error("User registration failed");
    }

    console.log("Auth user created successfully:", authData.user.id, "with role:", role);

    // 2. Create the user profile
    // Prepare profile data based on role
    const profileData = {
      id: authData.user.id,
      email,
      full_name,
      role,
      // Only include role-specific fields when they are provided
      nim: role === 'student' ? nim : null,
      nid: role === 'supervisor' ? nid : null,
      faculty: role === 'student' ? faculty : null,
      department: role === 'student' || role === 'supervisor' ? department : null
    };

    console.log("Creating profile with data:", JSON.stringify(profileData));

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData);

    if (profileError) {
      // Try to delete the auth user if profile creation fails
      console.error("Profile creation error:", profileError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    console.log("User profile created successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User successfully created", 
        userId: authData.user.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-user function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
