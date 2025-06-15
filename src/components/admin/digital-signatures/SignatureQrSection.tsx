
import React from "react";
import { SiLogoOverlay } from "./SiLogoOverlay";

interface Props {
  qr_code_url?: string;
}
export const SignatureQrSection = ({ qr_code_url }: Props) => {
  if (!qr_code_url) return null;
  return (
    <div>
      <h3 className="font-medium mb-2">QR Code</h3>
      <div className="border p-4 rounded-md flex justify-center">
        <div className="relative w-40 h-40 flex items-center justify-center bg-white rounded">
          {/* QR Code image as base */}
          <img 
            src={qr_code_url} 
            alt="QR Code" 
            className="w-40 h-40 object-contain"
            style={{ display: "block" }}
          />
          {/* Overlay: SI logo with ultra-thin white outline */}
          <SiLogoOverlay />
        </div>
      </div>
    </div>
  );
};
