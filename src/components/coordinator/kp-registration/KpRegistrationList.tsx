
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationRow } from "./kpRegistrationUtils";
import { Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const fetchRegistrations = async (): Promise<RegistrationRow[]> => {
  const { data, error } = await supabase
    .from("kp_registrations")
    .select(`
      id,
      student_id,
      semester,
      guardian_lecturer_id,
      registration_status,
      ipk,
      total_completed_credits,
      total_d_e_credits,
      d_e_courses,
      total_current_credits,
      total_credits,
      last_gpa_file,
      last_krs_file,
      status,
      notes,
      student:profiles!kp_registrations_student_id (full_name, nim)
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((row: any) => {
    let student = row.student;
    if (
      !student ||
      typeof student !== "object" ||
      typeof student.full_name !== "string" ||
      typeof student.nim !== "string"
    ) {
      student = { full_name: "-", nim: "-" };
    }
    return { ...row, student };
  });
};

export default function KpRegistrationList() {
  const { data: registrations, isLoading, error } = useQuery({
    queryKey: ["kp-registrations"],
    queryFn: fetchRegistrations,
  });

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<RegistrationRow | null>(null);

  function handleView(reg: RegistrationRow) {
    setSelected(reg);
    setOpen(true);
  }

  if (isLoading) return <div>Memuat data pendaftaran…</div>;
  if (error)   return <div className="text-red-600">Gagal memuat data: {error.message}</div>;

  return (
    <div className="py-6">
      <h3 className="font-bold text-lg mb-4">Daftar Pendaftar KP</h3>
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-slate-100 text-sm">
              <th className="px-3 py-2 text-left">NIM</th>
              <th className="px-3 py-2 text-left">Nama</th>
              <th className="px-3 py-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {(registrations || []).map((reg) => (
              <tr key={reg.id} className="border-b hover:bg-green-50">
                <td className="px-3 py-2">{reg.student.nim}</td>
                <td className="px-3 py-2">{reg.student.full_name}</td>
                <td className="px-3 py-2">
                  <Button size="icon" variant="ghost" onClick={() => handleView(reg)} title="Lihat Data">
                    <Eye />
                  </Button>
                </td>
              </tr>
            ))}
            {(registrations?.length ?? 0) === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-3 text-center italic text-gray-400">
                  Belum ada pendaftaran KP.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail KP */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Data Pendaftaran KP</DialogTitle>
          </DialogHeader>
          {!selected ? (
            <div>Memuat...</div>
          ) : (
            <div className="space-y-2 text-sm">
              <div><b>NIM:</b> {selected.student.nim}</div>
              <div><b>Nama:</b> {selected.student.full_name}</div>
              <div><b>Semester:</b> {selected.semester}</div>
              <div><b>Status Pendaftaran:</b> {selected.registration_status}</div>
              <div><b>Dosen Wali ID:</b> {selected.guardian_lecturer_id || "-"}</div>
              <div><b>IPK:</b> {selected.ipk}</div>
              <div><b>SKS Sudah Diambil:</b> {selected.total_completed_credits}</div>
              <div><b>SKS D/E:</b> {selected.total_d_e_credits}</div>
              <div><b>Matakuliah D/E:</b> {selected.d_e_courses || "-"}</div>
              <div><b>SKS Sedang Diambil:</b> {selected.total_current_credits}</div>
              <div><b>Total SKS:</b> {selected.total_credits}</div>
              <div><b>KHS/Transkrip:</b> {selected.last_gpa_file
                ? <a href={selected.last_gpa_file} target="_blank" className="underline text-green-700">Lihat File</a>
                : <span className="italic text-gray-400">-</span>
              }</div>
              <div><b>KRS Terakhir:</b> {selected.last_krs_file
                ? <a href={selected.last_krs_file} target="_blank" className="underline text-green-700">Lihat File</a>
                : <span className="italic text-gray-400">-</span>
              }</div>
              <div><b>Status Proses:</b> <span className="capitalize">{selected.status}</span></div>
              <div><b>Catatan:</b> {selected.notes || <span className="italic text-gray-400">-</span>}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
