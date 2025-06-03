
import React from 'react';
import { Button } from "@/components/ui/button";

interface SignatureStatusDisplayProps {
  status: string | undefined;
  previewUrl: string | null;
  onRequestUpload: () => void;
  onDelete: () => void;
  isSubmitting: boolean;
}

const SignatureStatusDisplay = ({ 
  status, 
  previewUrl, 
  onRequestUpload, 
  onDelete, 
  isSubmitting 
}: SignatureStatusDisplayProps) => {
  return (
    <>
      {previewUrl ? (
        <>
          <div className="flex justify-center">
            <div className="border p-6 rounded-lg bg-gray-50 max-w-xs">
              <img 
                src={previewUrl} 
                alt="Digital Signature" 
                className="h-32 object-contain mx-auto"
              />
              <p className="text-center mt-4 text-sm text-gray-600">
                Tanda tangan yang saat ini aktif
              </p>
            </div>
          </div>
          
          <div className={`p-4 rounded border flex items-start ${
            status === 'approved' ? 'bg-green-50 border-green-100' : 
            status === 'rejected' ? 'bg-red-50 border-red-100' : 
            'bg-yellow-50 border-yellow-100'
          }`}>
            <div className={`${
              status === 'approved' ? 'text-green-800' : 
              status === 'rejected' ? 'text-red-800' : 
              'text-yellow-800'
            }`}>
              <p className="font-medium">
                {status === 'approved' ? 'Tanda tangan disetujui' :
                 status === 'rejected' ? 'Tanda tangan ditolak' :
                 'Tanda tangan sedang diproses'}
              </p>
              <p className="text-sm mt-1">
                {status === 'approved' ? 
                  'Tanda tangan digital Anda telah disetujui dan QR Code telah dibuat.' :
                status === 'rejected' ? 
                  'Tanda tangan digital Anda ditolak. Silakan upload tanda tangan baru.' :
                  'Tanda tangan digital Anda sedang diproses oleh Super Admin untuk pembuatan QR Code validasi.'}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 p-4 rounded border border-yellow-100 flex items-start">
          <div className="text-yellow-800">
            <p className="font-medium">Belum ada tanda tangan</p>
            <p className="text-sm mt-1">
              Anda belum mengupload tanda tangan digital. Silakan upload tanda tangan 
              pada tab "Upload Tanda Tangan".
            </p>
          </div>
        </div>
      )}
      
      {previewUrl && (
        <div className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={onRequestUpload}
          >
            Upload Baru
          </Button>
          
          <Button 
            variant="destructive"
            onClick={onDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menghapus...' : 'Hapus Tanda Tangan'}
          </Button>
        </div>
      )}
    </>
  );
};

export default SignatureStatusDisplay;
