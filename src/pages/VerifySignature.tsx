
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface VerificationData {
  signatureId: string;
  supervisorId: string;
  supervisorName: string;
  timestamp: string;
  verified: boolean;
}

const VerifySignature = () => {
  const [searchParams] = useSearchParams();
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    
    if (!dataParam) {
      setError('Data verifikasi tidak ditemukan');
      setIsValid(false);
      return;
    }

    try {
      const decoded = decodeURIComponent(dataParam);
      const data = JSON.parse(decoded) as VerificationData;
      
      setVerificationData(data);
      
      // Verify the data integrity
      if (data.verified && data.signatureId && data.supervisorId && data.supervisorName) {
        setIsValid(true);
      } else {
        setIsValid(false);
        setError('Data verifikasi tidak valid');
      }
    } catch (err) {
      console.error('Error parsing verification data:', err);
      setError('Format data verifikasi tidak valid');
      setIsValid(false);
    }
  }, [searchParams]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <img 
            src="/LogoSI-removebg-preview.png" 
            alt="Logo SI" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            Verifikasi Tanda Tangan Digital
          </h1>
          <p className="text-gray-600 mt-2">
            Sistem Informasi Kerja Praktik
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {isValid === true && (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-green-800">Tanda Tangan Valid</span>
                </>
              )}
              {isValid === false && (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span className="text-red-800">Tanda Tangan Tidak Valid</span>
                </>
              )}
              {isValid === null && (
                <>
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                  <span className="text-yellow-800">Memverifikasi...</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            
            {verificationData && isValid && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm font-medium mb-2">
                    Dokumen ini telah ditandatangani dan diverifikasi secara digital oleh FSI UNJANI
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500 text-sm">Nama Dosen:</span>
                    <p className="font-medium">{verificationData.supervisorName}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 text-sm">ID Tanda Tangan:</span>
                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                      {verificationData.signatureId}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 text-sm">Waktu Verifikasi:</span>
                    <p className="font-medium">{formatDate(verificationData.timestamp)}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <p className="text-xs text-gray-500 text-center">
                    Copyright © 2025 Fakultas Sains dan Informatika Universitas Jenderal Achmad Yani
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifySignature;
