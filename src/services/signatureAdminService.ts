
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
      `);

    if (error) throw error;

    // Transform data to match our DigitalSignature interface
    return data.map((signature: any) => ({
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
  } catch (error) {
    console.error('Error fetching signatures:', error);
    throw error;
  }
};

export const approveSignature = async (signatureId: string, signatureSupervisorId: string, signatureSupervisorName: string): Promise<{ qr_code_url?: string }> => {
  try {
    // Update status to approved in Supabase
    const { error: updateError } = await supabase
      .from('digital_signatures')
      .update({ 
        status: 'approved', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', signatureId);

    if (updateError) throw updateError;
    
    // Generate QR code using our edge function
    const { data: qrData, error: qrError } = await supabase.functions.invoke('generate-qrcode', {
      body: {
        signatureId,
        supervisorId: signatureSupervisorId,
        supervisorName: signatureSupervisorName,
        baseUrl: window.location.origin
      }
    });

    if (qrError) throw qrError;
    
    // Create activity log
    await supabase.from('activity_logs').insert({
      user_id: '0', // System user or should be replaced with actual admin ID
      user_name: 'Admin',
      action: 'menyetujui tanda tangan digital',
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
      user_id: '0', // System user or should be replaced with actual admin ID
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
