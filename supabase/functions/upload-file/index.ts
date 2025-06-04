
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
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse the multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const path = formData.get("path") as string;
    const bucketName = formData.get("bucket") as string || "guide_documents";

    if (!file || !path) {
      throw new Error("File and path are required");
    }

    // Read the file as an array buffer
    const fileBuffer = await file.arrayBuffer();

    // Check if bucket exists and create if needed
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        console.error(`Error creating bucket: ${createError.message}`);
        // Continue anyway, as the bucket may have been created in another request
      }
    }

    // Ensure public access policies exist
    try {
      await ensurePublicPolicies(supabaseAdmin, bucketName);
    } catch (policyError) {
      console.error("Policy error:", policyError);
      // Continue anyway
    }

    // Upload the file using admin privileges
    console.log(`Uploading file to ${bucketName}/${path}`);
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(path, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Upload error: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(path);

    console.log("File uploaded successfully:", publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        publicUrl,
        message: "File uploaded successfully"
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
        success: false,
        error: error.message || String(error),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

// Helper function to ensure public access policies
async function ensurePublicPolicies(supabase: any, bucketName: string) {
  try {
    // Create policies for public select access
    await supabase.rpc('create_storage_policy', {
      bucket_name: bucketName,
      policy_name: `${bucketName}_public_select`,
      definition: true, // Allow public access for SELECT
      operation: 'SELECT',
      role_name: 'anon'
    });
    
    // Create policies for authenticated users to insert
    await supabase.rpc('create_storage_policy', {
      bucket_name: bucketName,
      policy_name: `${bucketName}_auth_insert`,
      definition: true, // Allow all authenticated users to INSERT
      operation: 'INSERT',
      role_name: 'authenticated'
    });
  } catch (error) {
    console.error("Error creating policies:", error);
    // Continue anyway
  }
}
