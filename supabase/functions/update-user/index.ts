
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
    const { userId, userData } = await req.json();

    if (!userId || !userData) {
      throw new Error("Missing required parameters");
    }

    console.log("Updating user:", userId);
    console.log("With data:", userData);

    // Create a Supabase client with the service role key (to bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Update the user metadata in auth.users if role has changed
    const { data: authUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (fetchError) {
      throw fetchError;
    }

    if (authUser && authUser.user) {
      const currentRole = authUser.user.user_metadata?.role;
      if (currentRole !== userData.role) {
        const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          {
            user_metadata: {
              ...authUser.user.user_metadata,
              role: userData.role,
              full_name: userData.full_name
            }
          }
        );

        if (updateAuthError) {
          console.error("Error updating auth user:", updateAuthError);
        }
      }
    }

    // 2. Update the user profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(userData)
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, message: "User successfully updated" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in update-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
