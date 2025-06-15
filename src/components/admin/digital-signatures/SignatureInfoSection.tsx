
import React from "react";

interface Supervisor {
  id: string;
  name: string;
  nip: string;
  department: string;
}

export const SignatureInfoSection = ({ supervisor }: { supervisor: Supervisor }) => (
  <div>
    <h3 className="font-medium mb-1">Informasi Dosen</h3>
    <div className="text-sm space-y-1">
      <p><span className="text-gray-500">Nama:</span> {supervisor.name}</p>
      <p><span className="text-gray-500">NIP:</span> {supervisor.nip}</p>
      <p><span className="text-gray-500">Department:</span> {supervisor.department}</p>
    </div>
  </div>
);
