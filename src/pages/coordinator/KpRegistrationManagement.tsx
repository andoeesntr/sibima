
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import KpRegistrationCard from "@/components/coordinator/kp-registration/KpRegistrationCard";
import KpRegistrationCardEditDialog from "@/components/coordinator/kp-registration/KpRegistrationCardEditDialog";
import { toast } from "sonner";

export type RegistrationRow = {
  id: string;
  student: { full_name: string; nim: string };
  student_id: string;
  semester: number;
  guardian_lecturer_id?: string | null;
  registration_status: string;
  ipk: number;
  total_completed_credits: number;
  total_d_e_credits: number;
  d_e_courses?: string | null;
  total_current_credits: number;
  total_credits: number;
  last_gpa_file?: string | null;
  last_krs_file?: string | null;
  status: string;
  notes?: string | null;
};

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

function filterWritableFields(fields: Partial<RegistrationRow>) {
  // exclude non-table and join fields
  const {
    student, // joined
    id, // taken separately
    ...rest
  } = fields;
  // Only allowed table fields
  const allowed = [
    "student_id", "semester", "guardian_lecturer_id", "registration_status", "ipk", "total_completed_credits",
    "total_d_e_credits", "d_e_courses", "total_current_credits", "total_credits",
    "last_gpa_file", "last_krs_file", "status", "notes"
  ];
  // Remove any keys not in allowed, and ensure ipk and other NOT NULLs are always sent for update/insert
  let result: any = {};
  for (const k of allowed) {
    if (fields[k as keyof typeof fields] !== undefined) {
      result[k] = fields[k as keyof typeof fields];
    }
  }
  return result;
}

export default function KpRegistrationManagement() {
  const [selected, setSelected] = React.useState<RegistrationRow | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["coordinator-kp-registrations"],
    queryFn: fetchRegistrations,
  });

  const mutation = useMutation({
    mutationFn: async ({ id, ...fields }: { id?: string } & Partial<RegistrationRow>) => {
      const sanitized = filterWritableFields(fields as Partial<RegistrationRow>);
      // Make sure required fields are set
      if (
        sanitized.ipk === undefined ||
        sanitized.semester === undefined ||
        sanitized.registration_status === undefined ||
        sanitized.total_completed_credits === undefined ||
        sanitized.total_d_e_credits === undefined ||
        sanitized.total_current_credits === undefined ||
        sanitized.total_credits === undefined ||
        sanitized.status === undefined
      ) {
        throw new Error("Semua field wajib diisi!");
      }
      if (id) {
        const { error } = await supabase
          .from("kp_registrations")
          .update({
            ...sanitized,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from("kp_registrations")
          .insert({
            ...sanitized,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coordinator-kp-registrations"] });
      toast.success("Pendaftaran KP berhasil disimpan!");
      setEditOpen(false);
      setIsCreating(false);
    },
    onError: (e: any) => toast.error(e.message || "Gagal menyimpan data"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("kp_registrations").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coordinator-kp-registrations"] });
      toast.success("Data berhasil dihapus");
    },
    onError: (e: any) => toast.error(e.message || "Gagal hapus data"),
  });

  function openEdit(reg: RegistrationRow) {
    setSelected(reg);
    setEditOpen(true);
    setIsCreating(false);
  }
  function openCreate() {
    setSelected(null);
    setEditOpen(true);
    setIsCreating(true);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manajemen Pendaftaran KP</h2>
        <button
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition-colors"
          onClick={openCreate}
        >
          + Tambah Pendaftaran
        </button>
      </div>
      {isLoading ? (
        <div className="text-center text-gray-500 py-8">Memuat data...</div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {data?.length ? (
            data.map((reg) => (
              <KpRegistrationCard
                key={reg.id}
                registration={reg}
                onEdit={() => openEdit(reg)}
                onDelete={() => deleteMutation.mutate(reg.id)}
                isDeleting={deleteMutation.isPending}
              />
            ))
          ) : (
            <div className="text-gray-500 py-4">Belum ada pendaftaran KP mahasiswa.</div>
          )}
        </div>
      )}

      <KpRegistrationCardEditDialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setIsCreating(false); }}
        initialData={selected}
        onSave={fields => {
          // fields does not contain id for create, but selected?.id for update
          mutation.mutate({ ...fields, id: selected?.id });
        }}
        isSubmitting={mutation.isPending}
        isCreate={isCreating}
      />
    </div>
  );
}
