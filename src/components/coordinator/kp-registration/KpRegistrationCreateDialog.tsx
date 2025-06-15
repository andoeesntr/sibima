
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { fetchLecturers } from "@/services/kpRegistrationService";
import { supabase } from "@/integrations/supabase/client";

// Fields used by the coordinator's CREATE dialog
type Lecturer = { id: string; full_name: string; role: string };

type FormState = {
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

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (fields: FormState) => void;
  isSubmitting: boolean;
};

export default function KpRegistrationCreateDialog({
  open, onClose, onSave, isSubmitting,
}: Props) {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [students, setStudents] = useState<{ id: string, full_name: string, nim: string }[]>([]);
  const [form, setForm] = useState<FormState>({
    student_id: "",
    semester: 6,
    registration_status: "baru",
    ipk: 0,
    total_completed_credits: 0,
    total_d_e_credits: 0,
    d_e_courses: "",
    total_current_credits: 0,
    total_credits: 0,
    status: "submitted",
    notes: "",
    guardian_lecturer_id: "",
    last_gpa_file: "",
    last_krs_file: "",
  });

  // Fetch lecturers & students
  useEffect(() => {
    if (open) {
      fetchLecturers().then(setLecturers);
      // Fetch all students
      supabase
        .from("profiles")
        .select("id, full_name, nim")
        .eq("role", "student")
        .then(({ data }) => setStudents(data || []));
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setForm({
        student_id: "",
        semester: 6,
        registration_status: "baru",
        ipk: 0,
        total_completed_credits: 0,
        total_d_e_credits: 0,
        d_e_courses: "",
        total_current_credits: 0,
        total_credits: 0,
        status: "submitted",
        notes: "",
        guardian_lecturer_id: "",
        last_gpa_file: "",
        last_krs_file: "",
      });
    }
  }, [open]);

  function updateField<K extends keyof FormState>(key: K, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={v => !isSubmitting && (v ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Pendaftaran KP</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="block text-sm font-bold mb-1">Mahasiswa</label>
            <Select value={form.student_id} onValueChange={v => updateField("student_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih mahasiswa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-</SelectItem>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nim} - {s.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Semester</label>
            <Select value={String(form.semester)} onValueChange={v => updateField("semester", Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                {[6, 7, 8, 9, 10].map((s) =>
                  <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Dosen Wali</label>
            <Select value={form.guardian_lecturer_id ?? ""} onValueChange={v => updateField("guardian_lecturer_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Dosen Wali" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-</SelectItem>
                {lecturers.map(lec => (
                  <SelectItem key={lec.id} value={lec.id}>
                    {lec.full_name} <span className="text-xs text-gray-500">({lec.role === "supervisor" ? "Dosen Pembimbing" : "Koordinator"})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Status Pendaftaran</label>
            <Select value={form.registration_status ?? ""} onValueChange={v => updateField("registration_status", v)}>
              <SelectTrigger><SelectValue placeholder="Status pendaftaran" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="baru">Baru</SelectItem>
                <SelectItem value="ulang ke 1">Ulang ke 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">IPK (I.P. Kumulatif)</label>
            <Input type="number" step="0.01" min="0" max="4.00"
                value={form.ipk} onChange={e => updateField("ipk", parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Total SKS Sudah Diambil</label>
            <Input type="number" min="0" value={form.total_completed_credits} 
              onChange={e => updateField("total_completed_credits", Number(e.target.value) || 0)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Total SKS Dengan Nilai D/E</label>
            <Input type="number" min="0" value={form.total_d_e_credits} 
              onChange={e => updateField("total_d_e_credits", Number(e.target.value) || 0)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Nama Matakuliah Dengan Nilai D/E</label>
            <Textarea value={form.d_e_courses ?? ""} 
                onChange={e => updateField("d_e_courses", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Total SKS Sedang Diambil</label>
            <Input type="number" min="0" value={form.total_current_credits ?? 0} 
              onChange={e => updateField("total_current_credits", Number(e.target.value) || 0)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Jumlah Total SKS (KHS + KRS)</label>
            <Input type="number" min="0" value={form.total_credits ?? 0} 
              onChange={e => updateField("total_credits", Number(e.target.value) || 0)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Catatan Koordinator</label>
            <Textarea className="min-h-[64px]" value={form.notes ?? ""} onChange={e => updateField("notes", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Status Proses</label>
            <Select value={form.status ?? "submitted"} onValueChange={v => updateField("status", v)}>
              <SelectTrigger><SelectValue placeholder="Status proses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="submitted">submitted</SelectItem>
                <SelectItem value="approved">approved</SelectItem>
                <SelectItem value="rejected">rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
          <Button
            onClick={() => onSave(form)}
            disabled={
              isSubmitting || !form.student_id
            }
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
