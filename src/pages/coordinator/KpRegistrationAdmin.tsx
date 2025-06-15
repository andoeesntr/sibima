
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationRow } from "@/components/coordinator/kp-registration/kpRegistrationUtils";
import KpRegistrationCard from "@/components/coordinator/kp-registration/KpRegistrationCard";

const fetchAllKpRegistrations = async (): Promise<RegistrationRow[]> => {
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

export default function KpRegistrationAdminPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["all-kp-registrations"],
    queryFn: fetchAllKpRegistrations,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kelola Pendaftaran KP</h1>
      {isLoading && <div>Memuat data pendaftaran…</div>}
      {error && (
        <div className="text-red-600">Gagal memuat data: {error.message}</div>
      )}
      <div className="flex flex-wrap gap-4">
        {(data || []).map((r) => (
          <KpRegistrationCard
            key={r.id}
            registration={r}
            onEdit={() => {}} // Bisa diimplementasikan sesuai kebutuhan
            onDelete={() => {}}
            isDeleting={false}
          />
        ))}
      </div>
      {data?.length === 0 && (
        <div className="text-gray-400 italic pt-8">Belum ada pendaftaran KP.</div>
      )}
    </div>
  );
}
