
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

    // Check if bucket exists first
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'signatures');

    if (!bucketExists) {
      console.log('Creating signatures bucket...');
      const { error: createError } = await supabaseAdmin.storage
        .createBucket('signatures', { 
          public: true,
          fileSizeLimit: 1024 * 1024, // 1MB
        });
        
      if (createError) {
        console.error("Error creating signatures bucket:", createError);
        // Don't throw here, continue with upload attempt
      } else {
        console.log("Signatures bucket created successfully");
      }
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
