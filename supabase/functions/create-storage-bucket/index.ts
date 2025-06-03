
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
    if (req.method !== "POST") {
      throw new Error("This endpoint only supports POST requests");
    }

    // Create a Supabase client with the service role key (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { bucketName } = await req.json();

    if (!bucketName) {
      throw new Error("No bucket name provided");
    }

    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      throw bucketsError;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    // If bucket doesn't exist, create it
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error: createBucketError } = await supabaseAdmin
        .storage
        .createBucket(bucketName, { 
          public: true,
          fileSizeLimit: 10485760 // 10MB limit
        });
      
      if (createBucketError) {
        console.error("Error creating bucket:", createBucketError);
        throw createBucketError;
      }
      
      // Create policies for the bucket to allow public access
      try {
        await supabaseAdmin.rpc('create_storage_policy', {
          bucket_name: bucketName,
          policy_name: `${bucketName}_public_select`,
          definition: `bucket_id = '${bucketName}'`,
          operation: 'SELECT',
          role_name: 'anon'
        });
        
        await supabaseAdmin.rpc('create_storage_policy', {
          bucket_name: bucketName,
          policy_name: `${bucketName}_auth_insert`,
          definition: `bucket_id = '${bucketName}' AND auth.role() = 'authenticated'`,
          operation: 'INSERT',
          role_name: 'authenticated'
        });
      } catch (policyError) {
        console.error("Policy creation error:", policyError);
        // Continue even if policy creation fails
      }
    } else {
      console.log(`Bucket ${bucketName} already exists`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: bucketExists ? "Bucket already exists" : "Bucket created successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    
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
