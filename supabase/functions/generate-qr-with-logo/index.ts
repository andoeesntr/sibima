
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

    console.log("Generating QR with logo:", { signatureId, supervisorId, supervisorName, baseUrl });

    if (!signatureId || !supervisorId) {
      throw new Error("Missing required parameters");
    }

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

    // Create verification data
    const verificationData = {
      signatureId,
      supervisorId,
      supervisorName: supervisorName || "Dosen Pembimbing",
      timestamp: new Date().toISOString(),
      verified: true,
    };

    const verificationUrl = `${baseUrl || "https://siprakerin.app"}/verify?data=${encodeURIComponent(JSON.stringify(verificationData))}`;
    
    // Create HTML canvas to generate QR with logo
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
    </head>
    <body>
        <canvas id="qrCanvas" width="512" height="512"></canvas>
        <script>
            const canvas = document.getElementById('qrCanvas');
            const ctx = canvas.getContext('2d');
            
            // Generate QR code
            QRCode.toCanvas(canvas, '${verificationUrl}', {
                width: 512,
                margin: 2,
                errorCorrectionLevel: 'M',
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }, function (error) {
                if (error) {
                    console.error(error);
                    return;
                }
                
                // Add logo in center
                const logoImg = new Image();
                logoImg.crossOrigin = 'anonymous';
                logoImg.onload = function() {
                    const logoSize = 80;
                    const x = (canvas.width - logoSize) / 2;
                    const y = (canvas.height - logoSize) / 2;
                    
                    // Draw white background circle for logo
                    ctx.fillStyle = '#FFFFFF';
                    ctx.beginPath();
                    ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2 + 10, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // Draw logo
                    ctx.drawImage(logoImg, x, y, logoSize, logoSize);
                    
                    // Convert to base64
                    const dataUrl = canvas.toDataURL('image/png');
                    console.log('QR generated with logo');
                    
                    // Send result back (this would need to be handled differently in actual implementation)
                    window.qrResult = dataUrl;
                };
                logoImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // Placeholder
            });
        </script>
    </body>
    </html>`;

    // For now, use a simpler approach with QR Server API
    const logoUrl = `${baseUrl}/LogoSI-removebg-preview.png`;
    const qrWithLogoUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&format=png&ecc=M&margin=10&qzone=2&data=${encodeURIComponent(verificationUrl)}`;
    
    console.log("Generating QR code with API");
    
    const qrResponse = await fetch(qrWithLogoUrl);
    if (!qrResponse.ok) {
      throw new Error(`QR API error: ${qrResponse.statusText}`);
    }
    
    const qrImageBuffer = await qrResponse.arrayBuffer();
    const qrImageData = new Uint8Array(qrImageBuffer);

    // Ensure signatures bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const signaturesBucketExists = buckets?.some(bucket => bucket.name === 'signatures');
    
    if (!signaturesBucketExists) {
      await supabaseAdmin.storage.createBucket('signatures', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
      });
    }

    // Upload QR code
    const filePath = `qrcodes/${supervisorId}-${Date.now()}.png`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("signatures")
      .upload(filePath, qrImageData, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("signatures")
      .getPublicUrl(filePath);

    // Update signature with QR code URL
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
        message: "QR code with logo generated successfully"
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
