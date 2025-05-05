
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

    if (!signatureId || !supervisorId) {
      throw new Error("Missing required parameters");
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch the digital signature
    const { data: signature, error: signatureError } = await supabaseAdmin
      .from('digital_signatures')
      .select('*')
      .eq('id', signatureId)
      .single();

    if (signatureError) {
      throw signatureError;
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
    // This creates a URL that can be used to verify the signature
    const verificationUrl = `${baseUrl || "https://siprakerin.app"}/verify?data=${encodeURIComponent(JSON.stringify(verificationData))}`;
    
    console.log("Generating QR code for URL:", verificationUrl);
    
    try {
      // Generate QR code as data URL
      const qrCodeDataURL = await qrcode.toDataURL(verificationUrl, {
        margin: 1,
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
        throw uploadError;
      }
      
      console.log("QR code uploaded successfully to path:", filePath);

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from("signatures")
        .getPublicUrl(filePath);

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
        throw updateError;
      }
      
      console.log("Digital signature updated with QR code URL:", publicUrl);

      return new Response(
        JSON.stringify({
          success: true,
          qr_code_url: publicUrl,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (qrError) {
      console.error("QR code generation error:", qrError);
      throw new Error(`QR code generation error: ${qrError.message || String(qrError)}`);
    }
  } catch (error) {
    console.error("Error generating QR code:", error);
    
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
