
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileImage, Trash } from 'lucide-react';

interface SignatureUploadAreaProps {
  previewUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

const SignatureUploadArea = ({ previewUrl, onFileChange, onRemove }: SignatureUploadAreaProps) => {
  return (
    <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
      {previewUrl ? (
        <div className="mb-4 flex flex-col items-center">
          <img 
            src={previewUrl} 
            alt="Signature Preview" 
            className="max-h-40 object-contain mb-4" 
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRemove}
          >
            <Trash size={14} className="mr-1" /> Hapus
          </Button>
        </div>
      ) : (
        <>
          <FileImage size={40} className="text-gray-400 mb-4" />
          <p className="mb-4 text-sm text-gray-600 text-center">
            Drag & drop file tanda tangan Anda di sini, atau klik tombol di bawah
          </p>
        </>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="signature-upload" className="sr-only">Upload tanda tangan</Label>
        <Input
          id="signature-upload"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default SignatureUploadArea;
