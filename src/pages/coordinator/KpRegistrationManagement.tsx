
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import KpRegistrationTable from "@/components/coordinator/kp-registration/KpRegistrationTable";
import KpRegistrationEditDialog from "@/components/coordinator/kp-registration/KpRegistrationEditDialog";
import { toast } from "sonner";

type RegistrationRow = {
  id: string;
  student: { full_name: string; nim: string };
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
  // NOTE: Penting! Pakai "profiles!kp_registrations_student_id" agar join tidak error
  const { data, error } = await supabase
    .from("kp_registrations")
    .select(`
      id,
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

export default function KpRegistrationManagement() {
  const [selected, setSelected] = React.useState<RegistrationRow | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["coordinator-kp-registrations"],
    queryFn: fetchRegistrations,
  });

  const mutation = useMutation({
    mutationFn: async ({
      id, ...fields
    }: { id: string } & Partial<RegistrationRow>) => {
      const { error } = await supabase
        .from("kp_registrations")
        .update({
          ...fields,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coordinator-kp-registrations"] });
      toast.success("Update berhasil!");
    },
    onError: (e: any) => toast.error(e.message || "Gagal update"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("kp_registrations").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coordinator-kp-registrations"] });
      toast.success("Data berhasil dihapus");
      setDeleteId(null);
    },
    onError: (e: any) => toast.error(e.message || "Gagal hapus data"),
  });

  const handleEdit = (reg: RegistrationRow) => {
    setSelected(reg);
    setEditOpen(true);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Manajemen Pendaftaran KP</h2>
      <KpRegistrationTable
        registrations={data || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={setDeleteId}
      />
      <KpRegistrationEditDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={selected}
        isSubmitting={mutation.isPending}
        onSave={(fields) => {
          if (!selected) return;
          mutation.mutate({
            id: selected.id,
            ...fields
          });
          setEditOpen(false);
        }}
        isCoordinator={true}
        // <- tambah prop "isCoordinator" agar dialog bisa bersifat full form
      />

      {/* Dialog Konfirmasi Hapus */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-md min-w-[280px] text-center">
            <h3 className="font-bold mb-4">Hapus Pendaftaran KP?</h3>
            <p className="mb-4">Apakah Anda yakin ingin menghapus data ini?</p>
            <div className="flex gap-2 justify-center">
              <button
                className="py-1.5 px-4 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                onClick={() => setDeleteId(null)}
                disabled={deleteMutation.isPending}
              >
                Batal
              </button>
              <button
                className="py-1.5 px-4 rounded bg-red-600 hover:bg-red-700 text-white"
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
