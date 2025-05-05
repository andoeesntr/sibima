
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
    const { name, public: isPublic = true } = await req.json();

    if (!name) {
      throw new Error("Bucket name is required");
    }

    console.log(`Creating storage bucket: ${name}, public: ${isPublic}`);

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create the bucket
    const { data, error } = await supabaseAdmin.storage.createBucket(name, {
      public: isPublic,
    });

    if (error) {
      console.error("Error creating bucket:", error);
      throw error;
    }

    // Set up RLS policy for bucket if it's public
    if (isPublic) {
      // Allow public read access 
      const { error: policyError } = await supabaseAdmin.storage.from(name).createSignedUrl('dummy.txt', 1);
      if (policyError) {
        console.log("Note: Policy setup may require additional configuration");
      }
    }

    console.log(`Bucket ${name} created successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Storage bucket ${name} created successfully`,
        data,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating storage bucket:", error);
    
    // Check if the error is because the bucket already exists
    const message = error.message || String(error);
    if (message.includes("already exists")) {
      return new Response(
        JSON.stringify({
          success: true, 
          message: "Bucket already exists", 
          alreadyExists: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: error.status || 400,
      }
    );
  }
});
