
import React from "react";
import { RegistrationRow } from "@/pages/coordinator/KpRegistrationManagement";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

type Props = {
  registration: RegistrationRow;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
};

const fileChip = (url?: string | null) => {
  if (!url) return <span className="text-gray-400 text-xs">(Belum ada file)</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-green-200 text-green-900 text-xs px-2 py-1 rounded hover:bg-green-300"
    >
      Lihat File
    </a>
  );
};

export default function KpRegistrationCard({
  registration, onEdit, onDelete, isDeleting
}: Props) {
  return (
    <div className="bg-white border rounded-xl shadow w-full max-w-sm flex flex-col p-4 relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-lg font-bold">{registration.student.nim}</div>
        <div className="ml-2 text-gray-500">{registration.student.full_name}</div>
        <div className="ml-auto flex gap-1">
          <Button size="icon" variant="ghost" onClick={onEdit}>
            <Edit size={18} />
          </Button>
          <Button size="icon" variant="destructive" onClick={onDelete} disabled={isDeleting}>
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
        <div className="font-semibold">Semester:</div><div>{registration.semester}</div>
        <div className="font-semibold">Status:</div>
        <div>
          <span className={
            registration.status === "submitted" ? "bg-blue-100 text-blue-800 px-1 rounded" :
            registration.status === "approved" ? "bg-green-100 text-green-800 px-1 rounded" :
            registration.status === "rejected" ? "bg-red-100 text-red-800 px-1 rounded" :
            "bg-gray-200 text-gray-700 px-1 rounded"
          }>
            {registration.status}
          </span>
        </div>
        <div className="font-semibold">IPK:</div><div>{registration.ipk}</div>
        <div className="font-semibold">SKS Lulus:</div><div>{registration.total_completed_credits}</div>
        <div className="font-semibold">SKS D/E:</div><div>{registration.total_d_e_credits}</div>
        <div className="font-semibold">Catatan:</div><div>{registration.notes || "-"}</div>
      </div>
      <div className="mt-2 flex gap-2 items-center">
        <span className="text-xs">KRS:</span> {fileChip(registration.last_krs_file)}
        <span className="text-xs ml-2">KHS/IPK:</span> {fileChip(registration.last_gpa_file)}
      </div>
    </div>
  );
}
