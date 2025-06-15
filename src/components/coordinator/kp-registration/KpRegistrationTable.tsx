
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type Registration = {
  id: string;
  student: {
    nim: string | null;
    full_name: string | null;
  };
  semester: number;
  ipk: number;
  registration_status: string;
  status: string;
  total_completed_credits: number;
  total_credits: number;
  notes?: string | null;
};

type Props = {
  registrations: Registration[];
  isLoading: boolean;
  onEdit: (reg: Registration) => void;
  onDelete: (id: string) => void;
};

export default function KpRegistrationTable({ registrations, isLoading, onEdit, onDelete }: Props) {
  if (isLoading) {
    return <div className="py-8 text-center text-gray-600">Memuat data...</div>;
  }

  if (!registrations?.length) {
    return <div className="py-8 text-center text-gray-600">Belum ada pendaftaran KP mahasiswa.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NIM</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>IPK</TableHead>
            <TableHead>Status Pendaftaran</TableHead>
            <TableHead>Status Proses</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map(reg => (
            <TableRow key={reg.id}>
              <TableCell>{reg.student.nim}</TableCell>
              <TableCell>{reg.student.full_name}</TableCell>
              <TableCell>{reg.semester}</TableCell>
              <TableCell>{reg.ipk}</TableCell>
              <TableCell>{reg.registration_status}</TableCell>
              <TableCell>
                <span className={
                  reg.status === "submitted" ? "px-2 py-1 text-xs rounded bg-blue-100 text-blue-800" :
                  reg.status === "approved" ? "px-2 py-1 text-xs rounded bg-green-100 text-green-800" :
                  reg.status === "rejected" ? "px-2 py-1 text-xs rounded bg-red-100 text-red-800" :
                  "px-2 py-1 text-xs rounded bg-gray-200 text-gray-700"
                }>
                  {reg.status}
                </span>
              </TableCell>
              <TableCell>{reg.notes || "-"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(reg)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(reg.id)}>Hapus</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
