
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import KpRegistrationCard from "./KpRegistrationCard";
import KpRegistrationCardEditDialog from "./KpRegistrationCardEditDialog";
import { RegistrationRow } from "./kpRegistrationUtils";
import { toast } from "sonner";
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

  // Placeholders for edit/delete (since dialogs/components are handled elsewhere)
  const handleEdit = (registration: RegistrationRow) => {
    toast.info("Edit dialog not implemented in this refactor.");
  };
  const handleDelete = (registration: RegistrationRow) => {
    toast.info("Delete dialog not implemented in this refactor.");
  };

  if (isLoading) return <div>Memuat data pendaftaran…</div>;
  if (error)   return <div className="text-red-600">Gagal memuat data: {error.message}</div>;

  return (
    <div className="py-6">
      <h3 className="font-bold text-lg mb-2">Daftar Pendaftaran KP</h3>
      <div className="flex flex-wrap gap-4">
        {(registrations || []).map(r => (
          <KpRegistrationCard
            key={r.id}
            registration={r}
            onEdit={() => handleEdit(r)}
            onDelete={() => handleDelete(r)}
            isDeleting={false}
          />
        ))}
      </div>
      {registrations?.length === 0 && (
        <div className="text-gray-400 italic pt-8">Belum ada pendaftaran KP.</div>
      )}
    </div>
  );
}
