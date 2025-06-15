
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

type Registration = {
  id: string;
  student: { full_name: string | null, nim: string | null };
  notes?: string | null;
  status: string;
  registration_status: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (fields: { notes: string; status: string; registration_status: string }) => void;
  initialData: Registration | null;
  isSubmitting: boolean;
};

export default function KpRegistrationEditDialog({
  open, onClose, onSave, initialData, isSubmitting,
}: Props) {
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [status, setStatus] = useState(initialData?.status || "submitted");
  const [registrationStatus, setRegistrationStatus] = useState(initialData?.registration_status || "baru");

  React.useEffect(() => {
    setNotes(initialData?.notes || "");
    setStatus(initialData?.status || "submitted");
    setRegistrationStatus(initialData?.registration_status || "baru");
  }, [initialData]);

  if (!initialData) return null;

  return (
    <Dialog open={open} onOpenChange={v => !isSubmitting && (v ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Pendaftaran – {initialData.student.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="block text-sm font-bold mb-1">Status Proses</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Pilih status proses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="submitted">submitted</SelectItem>
                <SelectItem value="approved">approved</SelectItem>
                <SelectItem value="rejected">rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Status Pendaftaran</label>
            <Select value={registrationStatus} onValueChange={setRegistrationStatus}>
              <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="baru">Baru</SelectItem>
                <SelectItem value="ulang ke 1">Ulang ke 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Catatan Koordinator</label>
            <Textarea className="min-h-[64px]" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
          <Button onClick={() => onSave({ notes, status, registration_status: registrationStatus })} disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
