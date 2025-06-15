import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationRow } from "./kpRegistrationUtils";

type FormState = Omit<RegistrationRow, "student" | "id"> & { id?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  initialData: RegistrationRow | null;
  onSave: (fields: Partial<FormState>) => void;
  isSubmitting: boolean;
  isCreate?: boolean;
};

export default function KpRegistrationCardEditDialog({
  open, onClose, initialData, onSave, isSubmitting, isCreate
}: Props) {
  const [form, setForm] = useState<Partial<FormState>>({});
  const [krsUploading, setKrsUploading] = useState(false);
  const [gpaUploading, setGpaUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...initialData } : {});
    }
  }, [open, initialData]);

  // File upload handler
  async function uploadFile(file: File, type: "last_krs_file" | "last_gpa_file") {
    const userId = initialData?.student_id || form.student_id;
    if (!userId) {
      alert("Pilih mahasiswa terlebih dahulu.");
      return;
    }
    try {
      if (type === "last_krs_file") setKrsUploading(true);
      else setGpaUploading(true);
      const ext = file.name.split('.').pop();
      const fileName = `${userId}/${type}/${Date.now()}.${ext}`;
      // Try upload to kp-documents bucket
      const { data, error } = await supabase
        .storage
        .from("kp-documents")
        .upload(fileName, file, { upsert: true });

      if (error) {
        throw new Error("Gagal upload file: " + error.message);
      }
      // Get public URL
      const { data: publicUrlData } = supabase.storage.from("kp-documents").getPublicUrl(fileName);
      setForm(f => ({ ...f, [type]: publicUrlData.publicUrl }));
    } catch (e: any) {
      alert(e.message || "Terjadi kesalahan saat upload.");
    } finally {
      setKrsUploading(false);
      setGpaUploading(false);
    }
  }

  function updateField<K extends keyof FormState>(key: K, val: any) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSave() {
    onSave(form);
  }

  return (
    <Dialog open={open} onOpenChange={v => !isSubmitting && (v ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCreate ? "Tambah Pendaftaran KP" : "Edit Pendaftaran KP"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2">
          <div>
            <label className="block text-sm font-bold mb-1">NIM</label>
            <Input
              value={initialData?.student.nim || ""}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Nama</label>
            <Input value={initialData?.student.full_name || ""} disabled />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Semester</label>
            <Input
              type="number"
              value={form.semester ?? ""}
              onChange={e => setForm(f => ({ ...f, semester: Number(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Status</label>
            <Select
              value={form.status ?? "submitted"}
              onValueChange={v => setForm(f => ({ ...f, status: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status proses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submitted">submitted</SelectItem>
                <SelectItem value="approved">approved</SelectItem>
                <SelectItem value="rejected">rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Catatan Koordinator</label>
            <Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2 items-center">
            <label className="block text-sm font-bold mb-1">KRS:</label>
            <input type="file" onChange={e => {
              if (e.target.files?.[0]) uploadFile(e.target.files[0], "last_krs_file");
            }} disabled={krsUploading} />
            {form.last_krs_file && (
              <a href={form.last_krs_file} target="_blank" rel="noopener noreferrer" className="text-green-700 underline ml-2">
                Lihat
              </a>
            )}
            {krsUploading && <span>Uploading...</span>}
          </div>
          <div className="flex gap-2 items-center">
            <label className="block text-sm font-bold mb-1">KHS/IPK:</label>
            <input type="file" onChange={e => {
              if (e.target.files?.[0]) uploadFile(e.target.files[0], "last_gpa_file");
            }} disabled={gpaUploading} />
            {form.last_gpa_file && (
              <a href={form.last_gpa_file} target="_blank" rel="noopener noreferrer" className="text-green-700 underline ml-2">
                Lihat
              </a>
            )}
            {gpaUploading && <span>Uploading...</span>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
          <Button onClick={() => onSave(form)} disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
