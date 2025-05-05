
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

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const path = formData.get("path") as string;

    if (!file) {
      throw new Error("No file provided");
    }

    if (!userId) {
      throw new Error("No userId provided");
    }

    if (!path) {
      throw new Error("No path provided");
    }

    console.log(`Processing upload for user ${userId}, file path: ${path}`);

    // Prepare the file for upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);
    const filePath = `${userId}/${path}`;

    try {
      // First, check if the signatures bucket exists
      const { data: buckets, error: bucketsError } = await supabaseAdmin
        .storage
        .listBuckets();
      
      if (bucketsError) {
        console.error("Error listing buckets:", bucketsError);
        throw bucketsError;
      }

      // Check if signatures bucket exists
      const signaturesBucketExists = buckets?.find(bucket => bucket.name === 'signatures');
      
      // If bucket doesn't exist, create it
      if (!signaturesBucketExists) {
        console.log('Creating signatures bucket...');
        const { error: createBucketError } = await supabaseAdmin
          .storage
          .createBucket('signatures', { public: true });
        
        if (createBucketError) {
          console.error("Error creating signatures bucket:", createBucketError);
          throw createBucketError;
        }
        
        // Create policies for the bucket to allow public access
        try {
          await supabaseAdmin.rpc('create_storage_policy', {
            bucket_name: 'signatures',
            policy_name: 'signatures_public_select',
            definition: `bucket_id = 'signatures'`,
            operation: 'SELECT',
            role_name: 'anon'
          });
          
          await supabaseAdmin.rpc('create_storage_policy', {
            bucket_name: 'signatures',
            policy_name: 'signatures_auth_insert',
            definition: `bucket_id = 'signatures' AND auth.role() = 'authenticated'`,
            operation: 'INSERT',
            role_name: 'authenticated'
          });
        } catch (policyError) {
          console.error("Policy creation error:", policyError);
          // Continue even if policy creation fails
        }
        
        // Let's wait a bit to make sure the bucket is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`Uploading file to path: ${filePath}`);

      // Upload the file using the admin client (bypassing RLS)
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('signatures')
        .upload(filePath, fileBuffer, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw uploadError;
      }

      console.log("File uploaded successfully, generating public URL");

      // Get the public URL
      const { data: { publicUrl } } = supabaseAdmin
        .storage
        .from('signatures')
        .getPublicUrl(filePath);

      return new Response(
        JSON.stringify({
          success: true,
          message: "File uploaded successfully",
          publicUrl
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (storageError) {
      console.error("Storage operation error:", storageError);
      throw new Error(`Storage operation error: ${storageError.message || String(storageError)}`);
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    
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
