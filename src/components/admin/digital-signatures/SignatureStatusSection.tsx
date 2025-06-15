
import React from "react";
import { CheckCircle, FileText, XCircle } from "lucide-react";

type SignatureStatus = "pending" | "approved" | "rejected";

interface Props {
  status: SignatureStatus;
  updated_at?: string;
  formatDate: (dateString?: string) => string;
}

export const SignatureStatusSection = ({ status, updated_at, formatDate }: Props) => (
  <div>
    <h3 className="font-medium mb-1">Status</h3>
    <div className="flex items-center">
      {status === "approved" && (
        <div className="flex items-center text-green-600">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span>Disetujui pada {formatDate(updated_at)}</span>
        </div>
      )}
      {status === "rejected" && (
        <div className="flex items-center text-red-600">
          <XCircle className="h-4 w-4 mr-1" />
          <span>Ditolak pada {formatDate(updated_at)}</span>
        </div>
      )}
      {status === "pending" && (
        <div className="flex items-center text-yellow-600">
          <FileText className="h-4 w-4 mr-1" />
          <span>Menunggu persetujuan</span>
        </div>
      )}
    </div>
  </div>
);
