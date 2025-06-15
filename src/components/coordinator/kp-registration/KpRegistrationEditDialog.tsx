
// Versi dialog edit lengkap, untuk Coordinator
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { fetchLecturers } from "@/services/kpRegistrationService";

type Registration = {
  id: string;
  student: { full_name: string, nim: string };
  semester: number;
  guardian_lecturer_id?: string | null;
  registration_status: string;
  ipk: number;
  total_completed_credits: number;
  total_d_e_credits: number;
  d_e_courses?: string | null;
  total_current_credits: number;
  total_credits: number;
  status: string;
  notes?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (fields: Partial<Registration>) => void;
  initialData: Registration | null;
  isSubmitting: boolean;
  isCoordinator?: boolean; // <-- for form full edit
};

export default function KpRegistrationEditDialog({
  open, onClose, onSave, initialData, isSubmitting, isCoordinator,
}: Props) {
  const [lecturers, setLecturers] = useState<{ id: string; full_name: string; role: string }[]>([]);
  const [form, setForm] = useState<Partial<Registration>>({});

  useEffect(() => {
    if (isCoordinator) {
      fetchLecturers().then(setLecturers);
    }
  }, [isCoordinator]);

  useEffect(() => {
    setForm(initialData ? { ...initialData } : {});
  }, [initialData]);

  if (!initialData) return null;

  // Handler for form value change
  function updateField<K extends keyof Registration>(key: K, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={v => !isSubmitting && (v ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Pendaftaran – {initialData.student.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="block text-sm font-bold mb-1">Semester Saat Ini</label>
            {isCoordinator ? (
              <Select value={String(form.semester ?? "")} onValueChange={v => updateField("semester", Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input type="number" value={form.semester ?? ""} disabled />
            )}
          </div>
          {isCoordinator && (
            <div>
              <label className="block text-sm font-bold mb-1">Dosen Wali</label>
              <Select value={form.guardian_lecturer_id ?? ""} onValueChange={v => updateField("guardian_lecturer_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Dosen Wali" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-</SelectItem>
                  {(lecturers || []).map(lec => (
                    <SelectItem key={lec.id} value={lec.id}>
                      {lec.full_name} <span className="text-xs text-gray-500">({lec.role === "supervisor" ? "Dosen Pembimbing" : "Koordinator"})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="block text-sm font-bold mb-1">Status Pendaftaran</label>
            <Select value={form.registration_status ?? ""} onValueChange={v => updateField("registration_status", v)}>
              <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="baru">Baru</SelectItem>
                <SelectItem value="ulang ke 1">Ulang ke 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">IPK (I.P. Kumulatif)</label>
            <Input type="number" step="0.01" min="0" max="4.00"
                value={form.ipk ?? ""} onChange={e => updateField("ipk", parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Total SKS Sudah Diambil</label>
            <Input type="number" min="0" value={form.total_completed_credits ?? ""} 
              onChange={e => updateField("total_completed_credits", Number(e.target.value) || 0)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Total SKS Dengan Nilai D/E</label>
            <Input type="number" min="0" value={form.total_d_e_credits ?? ""} 
              onChange={e => updateField("total_d_e_credits", Number(e.target.value) || 0)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Nama Matakuliah Dengan Nilai D/E</label>
            <Textarea value={form.d_e_courses ?? ""} 
                onChange={e => updateField("d_e_courses", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Total SKS Sedang Diambil</label>
            <Input type="number" min="0" value={form.total_current_credits ?? ""} 
              onChange={e => updateField("total_current_credits", Number(e.target.value) || 0)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Jumlah Total SKS (KHS + KRS)</label>
            <Input type="number" min="0" value={form.total_credits ?? ""} 
              onChange={e => updateField("total_credits", Number(e.target.value) || 0)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Catatan Koordinator</label>
            <Textarea className="min-h-[64px]" value={form.notes ?? ""} onChange={e => updateField("notes", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Status Proses</label>
            <Select value={form.status ?? "submitted"} onValueChange={v => updateField("status", v)}>
              <SelectTrigger><SelectValue placeholder="Pilih status proses" /></SelectTrigger>
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
          <Button onClick={() => onSave(form)} disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
