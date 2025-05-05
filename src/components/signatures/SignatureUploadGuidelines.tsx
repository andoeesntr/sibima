
import React from 'react';

const SignatureUploadGuidelines = () => {
  return (
    <div className="bg-gray-50 p-4 rounded border text-sm">
      <h3 className="font-medium mb-2">Panduan Upload Tanda Tangan</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-600">
        <li>Gunakan gambar tanda tangan dengan latar belakang transparan (format PNG)</li>
        <li>Ukuran file tidak lebih dari 1MB</li>
        <li>Resolusi yang disarankan: 300 DPI</li>
        <li>Pastikan tanda tangan terlihat jelas dan tidak buram</li>
      </ul>
    </div>
  );
};

export default SignatureUploadGuidelines;
