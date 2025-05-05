
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
    
    // Validate bucket name
    if (!name) {
      throw new Error("Bucket name is required");
    }
    
    console.log(`Creating storage bucket: ${name}, public: ${isPublic}`);
    
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    try {
      // Create the storage bucket
      const { data: createBucketData, error: createBucketError } = await supabaseAdmin
        .storage
        .createBucket(name, {
          public: isPublic,
        });
        
      if (createBucketError) {
        console.error("Error creating bucket:", createBucketError);
        throw createBucketError;
      }
      
      console.log("Bucket created successfully:", createBucketData);
      
      // Create appropriate RLS policies for the bucket
      if (isPublic) {
        // Allow public read access
        const { error: policyError1 } = await supabaseAdmin.rpc('create_storage_policy', {
          bucket_name: name,
          policy_name: `${name}_public_select`,
          definition: `bucket_id = '${name}'`,
          operation: 'SELECT',
          role_name: 'anon'
        });
        
        if (policyError1) {
          console.error("Error creating public SELECT policy:", policyError1);
        }
        
        // Allow authenticated users to insert objects
        const { error: policyError2 } = await supabaseAdmin.rpc('create_storage_policy', {
          bucket_name: name,
          policy_name: `${name}_auth_insert`,
          definition: `bucket_id = '${name}' AND auth.role() = 'authenticated'`,
          operation: 'INSERT',
          role_name: 'authenticated'
        });
        
        if (policyError2) {
          console.error("Error creating auth INSERT policy:", policyError2);
        }
        
        // Allow users to update their own objects
        const { error: policyError3 } = await supabaseAdmin.rpc('create_storage_policy', {
          bucket_name: name,
          policy_name: `${name}_auth_update`,
          definition: `bucket_id = '${name}' AND auth.uid() = owner`,
          operation: 'UPDATE',
          role_name: 'authenticated'
        });
        
        if (policyError3) {
          console.error("Error creating auth UPDATE policy:", policyError3);
        }
        
        // Allow users to delete their own objects
        const { error: policyError4 } = await supabaseAdmin.rpc('create_storage_policy', {
          bucket_name: name,
          policy_name: `${name}_auth_delete`,
          definition: `bucket_id = '${name}' AND auth.uid() = owner`,
          operation: 'DELETE',
          role_name: 'authenticated'
        });
        
        if (policyError4) {
          console.error("Error creating auth DELETE policy:", policyError4);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Storage bucket '${name}' created with public=${isPublic}`,
          bucket: createBucketData
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (error) {
      // Check if the error is because the bucket already exists
      if (error.message && error.message.includes("already exists")) {
        console.log(`Bucket ${name} already exists, skipping creation`);
        
        // Try to update the bucket's public/private setting
        try {
          const { data: updateData, error: updateError } = await supabaseAdmin
            .storage
            .updateBucket(name, {
              public: isPublic,
            });
            
          if (updateError) {
            console.error("Error updating bucket:", updateError);
            throw updateError;
          }
          
          return new Response(
            JSON.stringify({
              success: true,
              message: `Storage bucket '${name}' already exists, updated public setting to ${isPublic}`,
              bucket: updateData
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        } catch (updateError) {
          console.error("Error updating bucket:", updateError);
          throw updateError;
        }
      } else {
        console.error("Error creating storage bucket:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Error creating storage bucket:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || String(error),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
