import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  fetchLecturers,
  submitKpRegistration,
  uploadKpFile
} from "@/services/kpRegistrationService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Lecturer {
  id: string;
  full_name: string;
  role: string;
}

export const KpRegistrationForm: React.FC = () => {
  const { register, handleSubmit, setValue, watch, reset } = useForm();
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(false);
  const [khsFile, setKhsFile] = useState<File | null>(null);
  const [krsFile, setKrsFile] = useState<File | null>(null);

  useEffect(() => {
    fetchLecturers()
      .then(setLecturers)
      .catch(() => toast.error("Gagal memuat dosen wali"));
  }, []);

  // Tampilkan hanya dosen dengan role memuat kata "pembimbing" atau "koordinator"
  const guardianLecturers = lecturers.filter(
    (lec) =>
      typeof lec.role === "string" &&
      (lec.role.toLowerCase().includes("pembimbing") ||
        lec.role.toLowerCase().includes("koordinator"))
  );

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      // Handle uploads first
      let last_gpa_file = null, last_krs_file = null;
      if (khsFile) last_gpa_file = await uploadKpFile(khsFile, "khs");
      if (krsFile) last_krs_file = await uploadKpFile(krsFile, "krs");
      const payload = {
        ...data,
        semester: Number(data.semester),
        ipk: parseFloat(data.ipk),
        total_completed_credits: Number(data.total_completed_credits),
        total_d_e_credits: Number(data.total_d_e_credits),
        total_current_credits: Number(data.total_current_credits),
        total_credits: Number(data.total_credits),
        d_e_courses: data.d_e_courses, // as string
        last_gpa_file,
        last_krs_file,
      };
      await submitKpRegistration(payload);
      toast.success("Pendaftaran KP berhasil terkirim!");
      reset();
      setKhsFile(null); setKrsFile(null);
    } catch (e: any) {
      toast.error(e.message || "Gagal mendaftar KP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="max-w-xl w-full mx-auto p-6 bg-white rounded-xl space-y-6 shadow" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block font-bold mb-1">Semester Saat Ini</label>
        <Select {...register("semester")} onValueChange={(value) => setValue("semester", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">6</SelectItem>
            <SelectItem value="8">8</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block font-bold mb-1">Dosen Wali</label>
        <Select
          {...register("guardian_lecturer_id")}
          onValueChange={val => setValue("guardian_lecturer_id", val)}
          disabled={lecturers.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={guardianLecturers.length === 0 ? "Tidak ada dosen pembimbing/koordinator" : "Pilih Dosen Wali"} />
          </SelectTrigger>
          <SelectContent>
            {guardianLecturers.length > 0 ? (
              guardianLecturers.map(lec => (
                <SelectItem key={lec.id} value={lec.id}>
                  {lec.full_name} <span className="text-xs text-gray-500">({lec.role})</span>
                </SelectItem>
              ))
            ) : (
              <div className="text-sm text-gray-500 px-2 py-2">Tidak ada dosen pembimbing/koordinator tersedia.</div>
            )}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block font-bold mb-1">Status Pendaftaran</label>
        <Select {...register("registration_status")} onValueChange={val => setValue("registration_status", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="baru">Baru</SelectItem>
            <SelectItem value="ulang ke 1">Ulang ke 1</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block font-bold mb-1">IPK (I.P. Kumulatif)</label>
        <Input type="number" step="0.01" min="0" max="4.00" {...register("ipk", { required: true })} />
      </div>
      <div>
        <label className="block font-bold mb-1">Total SKS Sudah Diambil</label>
        <Input type="number" min="0" {...register("total_completed_credits", { required: true })} />
      </div>
      <div>
        <label className="block font-bold mb-1">Total SKS Dengan Nilai D/E</label>
        <Input type="number" min="0" {...register("total_d_e_credits", { required: true })} />
      </div>
      <div>
        <label className="block font-bold mb-1">Nama Matakuliah Dengan Nilai D/E</label>
        <Textarea {...register("d_e_courses")} placeholder="Nama-nama matakuliah pisahkan dengan koma, contoh: Basis Data, Fisika Dasar" />
      </div>
      <div>
        <label className="block font-bold mb-1">Total SKS Sedang Diambil</label>
        <Input type="number" min="0" {...register("total_current_credits", { required: true })} />
      </div>
      <div>
        <label className="block font-bold mb-1">Jumlah Total SKS (KHS + KRS)</label>
        <Input type="number" min="0" {...register("total_credits", { required: true })} />
      </div>
      <div>
        <label className="block font-bold mb-1">KHS/Transkrip Nilai Terakhir (Upload File)</label>
        <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => setKhsFile(e.target.files?.[0] || null)} />
      </div>
      <div>
        <label className="block font-bold mb-1">KRS Terakhir (Upload File)</label>
        <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => setKrsFile(e.target.files?.[0] || null)} />
      </div>
      <div className="pt-2">
        <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Submit Pendaftaran KP"}</Button>
      </div>
    </form>
  );
};
