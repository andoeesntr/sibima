
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

type RegisterData = {
  email: string;
  password: string;
  full_name?: string;
  nim?: string;
  nip?: string;
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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    // Create the admin client properly
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    const { email, password, full_name, role, nim, nip, faculty, department } = await req.json() as RegisterData

    if (!email || !password || !role) {
      return new Response(
        JSON.stringify({ 
          error: 'Email, password, and role are required' 
        }), 
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    console.log("Creating user with email:", email, "and role:", role)

    // Create user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    })

    if (authError) {
      console.error("Auth error:", authError)
      return new Response(
        JSON.stringify({ error: authError.message }), 
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    if (!authData.user) {
      console.error("No user created")
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }), 
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    console.log("User created with ID:", authData.user.id)

    // Update the profile with additional data
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name,
        role,
        nim,
        nip, 
        faculty,
        department
      })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error("Profile update error:", profileError)
      // If profile update fails, we should ideally delete the user, but for simplicity we'll just return the error
      return new Response(
        JSON.stringify({ error: `User created but profile update failed: ${profileError.message}` }), 
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    console.log("Profile updated successfully for user:", authData.user.id)

    return new Response(
      JSON.stringify({ 
        message: 'User registered successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role
        }
      }), 
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  } catch (error) {
    console.error('Error in register function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  }
})
