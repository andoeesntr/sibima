
import React from "react";

export const SignatureImageSection = ({ signature_url }: { signature_url?: string }) => {
  if (!signature_url) return null;
  return (
    <div>
      <h3 className="font-medium mb-2">Tanda Tangan</h3>
      <div className="border p-4 rounded-md flex justify-center">
        <img 
          src={signature_url} 
          alt="Digital Signature" 
          className="max-h-40 object-contain"
        />
      </div>
    </div>
  );
};
