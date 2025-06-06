
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Supervisor {
  id: string;
  name: string;
  nip: string;
  department: string;
}

type SignatureStatus = "pending" | "approved" | "rejected";

interface DigitalSignature {
  id: string;
  supervisor: Supervisor;
  status: SignatureStatus;
  signature_url?: string;
  qr_code_url?: string;
  created_at: string;
  updated_at: string;
}

export const fetchSignatures = async (): Promise<DigitalSignature[]> => {
  try {
    console.log('Fetching digital signatures...');
    
    const { data, error } = await supabase
      .from('digital_signatures')
      .select(`
        id, 
        status,
        signature_url,
        qr_code_url,
        created_at,
        updated_at,
        supervisor_id,
        profiles:supervisor_id (
          id, 
          full_name,
          nip,
          department
        )
      `)
      .not('status', 'eq', 'deleted');

    if (error) {
      console.error('Error fetching signatures:', error);
      throw error;
    }

    console.log('Raw signature data:', data);

    if (!data || data.length === 0) {
      console.log('No signatures found');
      return [];
    }

    // Transform data to match our DigitalSignature interface
    const transformedData = data
      .filter(signature => signature.profiles) // Only include signatures with valid profiles
      .map((signature: any) => ({
        id: signature.id,
        supervisor: {
          id: signature.profiles.id,
          name: signature.profiles.full_name || 'Unnamed Supervisor',
          nip: signature.profiles.nip || '-',
          department: signature.profiles.department || '-'
        },
        status: signature.status as SignatureStatus,
        signature_url: signature.signature_url,
        qr_code_url: signature.qr_code_url,
        created_at: signature.created_at,
        updated_at: signature.updated_at
      }));

    console.log('Transformed signature data:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error fetching signatures:', error);
    throw error;
  }
};

export const approveSignature = async (signatureId: string, signatureSupervisorId: string, signatureSupervisorName: string): Promise<{ qr_code_url?: string }> => {
  try {
    console.log('Approving signature:', { signatureId, signatureSupervisorId, signatureSupervisorName });
    
    // First update status to approved in database
    const { error: updateError } = await supabase
      .from('digital_signatures')
      .update({ 
        status: 'approved', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', signatureId);

    if (updateError) {
      console.error('Error updating signature status:', updateError);
      throw updateError;
    }
    
    console.log('Signature status updated to approved, now generating QR code with logo...');
    
    // Generate QR code with logo using the new edge function
    const { data: qrData, error: qrError } = await supabase.functions.invoke('generate-qr-with-logo', {
      body: {
        signatureId,
        supervisorId: signatureSupervisorId,
        supervisorName: signatureSupervisorName,
        baseUrl: window.location.origin
      }
    });
    
    if (qrError) {
      console.error('Error generating QR code with logo:', qrError);
      
      // Fallback to original function
      console.log('Falling back to original QR generation...');
      const { data: fallbackQrData, error: fallbackQrError } = await supabase.functions.invoke('generate-qrcode', {
        body: {
          signatureId,
          supervisorId: signatureSupervisorId,
          supervisorName: signatureSupervisorName,
          baseUrl: window.location.origin
        }
      });
      
      if (fallbackQrError) {
        console.error('Error with fallback QR generation:', fallbackQrError);
        toast.error('Tanda tangan disetujui, namun QR code gagal dibuat');
        return {};
      }
      
      console.log('Fallback QR code generated successfully:', fallbackQrData);
      
      // Create activity log
      await supabase.from('activity_logs').insert({
        user_id: '0',
        user_name: 'Admin',
        action: 'menyetujui tanda tangan digital',
        target_type: 'signature',
        target_id: signatureId
      });

      return fallbackQrData || {};
    }
    
    console.log('QR code with logo generated successfully:', qrData);
    
    // Create activity log
    await supabase.from('activity_logs').insert({
      user_id: '0',
      user_name: 'Admin',
      action: 'menyetujui tanda tangan digital dengan QR code berlogo',
      target_type: 'signature',
      target_id: signatureId
    });

    return qrData || {};
  } catch (error) {
    console.error('Error approving signature:', error);
    throw error;
  }
};

export const rejectSignature = async (signatureId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('digital_signatures')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', signatureId);

    if (error) throw error;
    
    // Create activity log
    await supabase.from('activity_logs').insert({
      user_id: '0',
      user_name: 'Admin',
      action: 'menolak tanda tangan digital',
      target_type: 'signature',
      target_id: signatureId
    });
  } catch (error) {
    console.error('Error rejecting signature:', error);
    throw error;
  }
};
