
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

    const contentType = req.headers.get("content-type") || "";
    
    // Handle bucket creation requests
    if (contentType.includes("application/json")) {
      const body = await req.json();
      
      if (body.action === "create_bucket") {
        const bucketName = body.bucket || "kp-documents";
        
        console.log(`Creating bucket: ${bucketName}`);
        
        // Check if bucket exists first
        const { data: buckets } = await supabaseAdmin.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
        
        if (!bucketExists) {
          const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 10485760 // 10MB
          });
          
          if (createError) {
            throw new Error(`Failed to create bucket: ${createError.message}`);
          }
          
          console.log(`Bucket ${bucketName} created successfully`);
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            message: `Bucket ${bucketName} ready`
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    }

    // Handle file upload requests
    if (contentType.includes("multipart/form-data")) {
      // Parse the multipart form data
      const formData = await req.formData();
      const file = formData.get("file") as File;
      const path = formData.get("path") as string;
      const bucketName = formData.get("bucket") as string || "kp-documents";

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
    }

    throw new Error("Invalid request format");
    
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
