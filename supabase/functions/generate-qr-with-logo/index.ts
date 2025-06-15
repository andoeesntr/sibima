import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { signatureId, supervisorId, supervisorName, baseUrl } = await req.json();

    console.log("Generating QR with embedded logo:", { signatureId, supervisorId, supervisorName, baseUrl });

    if (!signatureId || !supervisorId) throw new Error("Missing required parameters");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify signature exists and is approved
    const { data: signature, error: signatureError } = await supabaseAdmin
      .from('digital_signatures')
      .select('*')
      .eq('id', signatureId)
      .single();

    if (signatureError || signature.status !== 'approved') {
      throw new Error("Signature must be approved before generating QR code");
    }

    const verificationData = {
      signatureId,
      supervisorId,
      supervisorName: supervisorName || "Dosen Pembimbing",
      timestamp: new Date().toISOString(),
      verified: true,
    };

    const verificationUrl = `${baseUrl || "https://siprakerin.app"}/verify?data=${encodeURIComponent(JSON.stringify(verificationData))}`;

    const qrSize = 400;
    const logoSize = Math.round(qrSize * 0.2); // 20% for logo (80px)
    const qrWithLogoUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&format=png&ecc=H&margin=1&data=${encodeURIComponent(verificationUrl)}`;

    // Download base QR
    const qrResponse = await fetch(qrWithLogoUrl);
    if (!qrResponse.ok) throw new Error(`QR generation failed: ${qrResponse.statusText}`);
    const qrBuffer = await qrResponse.arrayBuffer();

    // Download SI logo
    const logoFetchUrl = `${baseUrl}/LogoSI-removebg-preview.png`;
    const logoResponse = await fetch(logoFetchUrl);
    if (!logoResponse.ok) {
      // fallback: upload QR as is
      const qrImageData = new Uint8Array(qrBuffer);
      // Ensure signatures bucket exists
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const signaturesBucketExists = buckets?.some(bucket => bucket.name === 'signatures');
      if (!signaturesBucketExists) {
        await supabaseAdmin.storage.createBucket('signatures', {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024,
        });
      }
      const filePath = `qrcodes/${supervisorId}-${Date.now()}-withlogo.png`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from("signatures")
        .upload(filePath, qrImageData, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from("signatures")
        .getPublicUrl(filePath);

      // Update signature db
      await supabaseAdmin
        .from('digital_signatures')
        .update({
          qr_code_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', signatureId);
      return new Response(
        JSON.stringify({
          success: true,
          qr_code_url: publicUrl,
          message: "QR code generated without logo (logo fetch failed)"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    const logoBuffer = await logoResponse.arrayBuffer();

    // Try to merge logo and QR using OffscreenCanvas (if available in edge runtime)
    let mergedPng;
    try {
      const qrBlob = new Blob([qrBuffer], { type: "image/png" });
      const logoBlob = new Blob([logoBuffer], { type: "image/png" });
      const qrImage = await createImageBitmap(qrBlob);
      const logoImage = await createImageBitmap(logoBlob);

      // Create canvas
      // @ts-ignore Edge functions may have OffscreenCanvas support, fallback error if not
      const canvas: any = new (globalThis.OffscreenCanvas || OffscreenCanvas)(qrSize, qrSize);
      const ctx = canvas.getContext("2d");

      // Draw QR code as base
      ctx.drawImage(qrImage, 0, 0, qrSize, qrSize);

      // Draw white circle for thin outline around logo
      ctx.save();
      ctx.beginPath();
      ctx.arc(qrSize / 2, qrSize / 2, logoSize / 2 + 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = "#FFF";
      ctx.shadowColor = "#EEE";
      ctx.shadowBlur = 1;
      ctx.fill();
      ctx.restore();

      // Draw logo in center
      ctx.drawImage(
        logoImage,
        qrSize / 2 - logoSize / 2,
        qrSize / 2 - logoSize / 2,
        logoSize,
        logoSize
      );

      // Convert to PNG buffer
      mergedPng = await canvas.convertToBlob
        ? await canvas.convertToBlob({ type: "image/png" })
        : await new Promise<Blob>((resolve) => canvas.toBlob((blob: Blob) => resolve(blob), "image/png"));

    } catch (e) {
      console.warn("Failed to compose logo in QR (OffscreenCanvas not available):", e);
      mergedPng = null;
    }

    let uploadBuffer;
    if (mergedPng) {
      uploadBuffer = new Uint8Array(await mergedPng.arrayBuffer());
    } else {
      // fallback: use QR code only (no logo)
      uploadBuffer = new Uint8Array(qrBuffer);
    }

    // Ensure signatures bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const signaturesBucketExists = buckets?.some(bucket => bucket.name === 'signatures');
    if (!signaturesBucketExists) {
      await supabaseAdmin.storage.createBucket('signatures', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
      });
    }
    const filePath = `qrcodes/${supervisorId}-${Date.now()}-withlogo.png`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("signatures")
      .upload(filePath, uploadBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("signatures")
      .getPublicUrl(filePath);

    // Update signature db
    await supabaseAdmin
      .from('digital_signatures')
      .update({
        qr_code_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', signatureId);

    return new Response(
      JSON.stringify({
        success: true,
        qr_code_url: publicUrl,
        has_embedded_logo: !!mergedPng,
        message: mergedPng
          ? "QR code with embedded logo SI generated and uploaded"
          : "QR code generated (logo embedding not supported in runtime, using overlay in frontend)"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in generate-qr-with-logo function:", error);
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
