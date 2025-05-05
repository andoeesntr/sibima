
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
    const reqData = await req.json();
    const { signatureId, status, signature_url, supervisor_id } = reqData;
    
    console.log("Received request with data:", reqData);

    // Validate required parameters
    if ((!signatureId && !supervisor_id) || !status) {
      throw new Error("Missing required parameters");
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Prepare the update data object
    const updateData: Record<string, any> = {
      status,
      updated_at: new Date().toISOString()
    };
    
    // If signature_url is provided, add it to the updateData
    if (signature_url) {
      updateData.signature_url = signature_url;
    }
    
    let result;
    let error;
    
    // If signatureId is provided, update existing record
    if (signatureId) {
      console.log(`Updating signature with ID: ${signatureId}`);
      const { data, error: updateError } = await supabaseAdmin
        .from('digital_signatures')
        .update(updateData)
        .eq('id', signatureId)
        .select();
        
      result = data;
      error = updateError;
    } 
    // If supervisor_id is provided but no signatureId, we need to insert or update
    else if (supervisor_id) {
      console.log(`Checking for existing signature for supervisor: ${supervisor_id}`);
      // First check if a record exists for this supervisor
      const { data: existingRecord, error: lookupError } = await supabaseAdmin
        .from('digital_signatures')
        .select('id')
        .eq('supervisor_id', supervisor_id)
        .maybeSingle();
      
      if (lookupError) {
        console.error("Error checking for existing record:", lookupError);
        throw lookupError;
      }
        
      if (existingRecord) {
        console.log(`Found existing signature with ID: ${existingRecord.id}, updating...`);
        // Update existing record
        const { data: updateData2, error: updateError } = await supabaseAdmin
          .from('digital_signatures')
          .update(updateData)
          .eq('id', existingRecord.id)
          .select();
          
        result = updateData2;
        error = updateError;
      } else {
        console.log(`No existing signature found for supervisor: ${supervisor_id}, creating new record...`);
        // Insert new record
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('digital_signatures')
          .insert({
            supervisor_id,
            ...updateData
          })
          .select();
          
        result = insertData;
        error = insertError;
      }
    }

    if (error) {
      console.error("Database operation error:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Signature status updated to ${status}`,
        data: result
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating signature status:", error);
    
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
