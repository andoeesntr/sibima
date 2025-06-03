
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SignatureStatus {
  id: string | null;
  status: string | null;
  signature_url: string | null;
  qr_code_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useSignatureStatus = () => {
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>({
    id: null,
    status: null,
    signature_url: null,
    qr_code_url: null,
    created_at: null,
    updated_at: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchSignatureStatus = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('Fetching signature status for user:', user.id);
      
      const { data, error } = await supabase
        .from('digital_signatures')
        .select('id, status, signature_url, qr_code_url, created_at, updated_at')
        .eq('supervisor_id', user.id)
        .not('status', 'eq', 'deleted')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching signature status:', error);
        return;
      }

      console.log('Signature status data:', data);

      if (data) {
        setSignatureStatus({
          id: data.id,
          status: data.status,
          signature_url: data.signature_url,
          qr_code_url: data.qr_code_url,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      } else {
        setSignatureStatus({
          id: null,
          status: null,
          signature_url: null,
          qr_code_url: null,
          created_at: null,
          updated_at: null
        });
      }
    } catch (error) {
      console.error('Error in fetchSignatureStatus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSignatureStatus();
  }, [user?.id]);

  return {
    signatureStatus,
    isLoading,
    refetchSignatureStatus: fetchSignatureStatus
  };
};
