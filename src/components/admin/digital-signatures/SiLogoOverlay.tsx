
import React from "react";

// For absolute minimum white gap, the white circle is just 1px larger than the logo
export const SiLogoOverlay = () => (
  <div className="absolute left-1/2 top-1/2 pointer-events-none"
       style={{ transform: 'translate(-50%, -50%)' }}>
    <div
      className="flex items-center justify-center rounded-full bg-white"
      style={{
        width: 37,
        height: 37
      }}
    >
      <img
        src="/LogoSI-removebg-preview.png"
        alt="Logo SI"
        className="object-contain"
        style={{
          width: 36,
          height: 36,
          background: "transparent"
        }}
      />
    </div>
  </div>
);
