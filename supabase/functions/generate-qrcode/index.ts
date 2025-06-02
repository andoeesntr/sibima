
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as qrcode from "https://esm.sh/qrcode@1.5.3";

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
    const { signatureId, supervisorId, supervisorName, baseUrl } = await req.json();

    console.log("Received QR generation request:", { signatureId, supervisorId, supervisorName, baseUrl });

    if (!signatureId || !supervisorId) {
      throw new Error("Missing required parameters: signatureId or supervisorId");
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch the digital signature to verify it exists and is approved
    const { data: signature, error: signatureError } = await supabaseAdmin
      .from('digital_signatures')
      .select('*')
      .eq('id', signatureId)
      .single();

    if (signatureError) {
      console.error("Error fetching signature:", signatureError);
      throw new Error(`Failed to fetch signature: ${signatureError.message}`);
    }

    if (signature.status !== 'approved') {
      throw new Error("Signature must be approved before generating QR code");
    }

    // Create verification data
    const verificationData = {
      signatureId,
      supervisorId,
      supervisorName: supervisorName || "Dosen Pembimbing",
      timestamp: new Date().toISOString(),
      verified: true,
    };

    // Generate QR code with verification data
    const verificationUrl = `${baseUrl || "https://siprakerin.app"}/verify?data=${encodeURIComponent(JSON.stringify(verificationData))}`;
    
    console.log("Generating QR code for URL:", verificationUrl);
    
    try {
      // Check if signatures bucket exists, if not create it
      const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
      
      if (bucketsError) {
        console.error("Error listing buckets:", bucketsError);
      }
      
      const signaturesBucketExists = buckets?.some(bucket => bucket.name === 'signatures');
      
      if (!signaturesBucketExists) {
        console.log("Creating signatures bucket");
        const { error: bucketError } = await supabaseAdmin.storage.createBucket('signatures', {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024, // 5MB
        });
        
        if (bucketError) {
          console.error("Error creating bucket:", bucketError);
          throw new Error(`Failed to create signatures bucket: ${bucketError.message}`);
        }
        console.log("Signatures bucket created successfully");
      }
      
      // Generate QR code as data URL
      const qrCodeDataURL = await qrcode.toDataURL(verificationUrl, {
        margin: 2,
        width: 512,
        errorCorrectionLevel: 'M',
      });
      
      console.log("QR code generated successfully");

      // Convert data URL to binary data
      const base64Data = qrCodeDataURL.split(",")[1];
      const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

      // Upload to storage
      const filePath = `qrcodes/${supervisorId}-${Date.now()}.png`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from("signatures")
        .upload(filePath, binaryData, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        console.error("Error uploading QR code:", uploadError);
        throw new Error(`Failed to upload QR code: ${uploadError.message}`);
      }
      
      console.log("QR code uploaded successfully to path:", filePath);

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from("signatures")
        .getPublicUrl(filePath);

      console.log("QR code public URL:", publicUrl);

      // Update the digital signature with QR code URL
      const { error: updateError } = await supabaseAdmin
        .from('digital_signatures')
        .update({
          qr_code_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', signatureId);

      if (updateError) {
        console.error("Error updating signature with QR code URL:", updateError);
        throw new Error(`Failed to update signature: ${updateError.message}`);
      }
      
      console.log("Digital signature updated with QR code URL successfully");

      return new Response(
        JSON.stringify({
          success: true,
          qr_code_url: publicUrl,
          message: "QR code generated and signature updated successfully"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (qrError) {
      console.error("QR code generation error:", qrError);
      throw new Error(`QR code generation failed: ${qrError.message || String(qrError)}`);
    }
  } catch (error) {
    console.error("Error in generate-qrcode function:", error);
    
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
