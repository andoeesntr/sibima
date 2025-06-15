
-- Tabel baru untuk pendaftaran KP
CREATE TABLE public.kp_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  semester INTEGER NOT NULL CHECK (semester IN (6, 8)),
  guardian_lecturer_id UUID REFERENCES profiles(id), -- dosen wali
  registration_status TEXT NOT NULL CHECK (registration_status IN ('baru', 'ulang ke 1')),
  ipk NUMERIC(3,2) NOT NULL,
  total_completed_credits INTEGER NOT NULL,          -- total sks yang sudah diambil
  total_d_e_credits INTEGER NOT NULL,                -- total sks d/e
  d_e_courses TEXT,                                  -- nama matakuliah d/e (json array as string)
  total_current_credits INTEGER NOT NULL,            -- total sks sedang diambil
  total_credits INTEGER NOT NULL,                    -- jumlah total sks (khs + krs)
  last_gpa_file TEXT,                               -- file url khs atau transkrip nilai terakhir
  last_krs_file TEXT,                               -- file url krs terakhir
  status TEXT NOT NULL DEFAULT 'submitted',         -- status proses ('submitted', 'approved', 'rejected', etc.)
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aktifkan Row Level Security
ALTER TABLE public.kp_registrations ENABLE ROW LEVEL SECURITY;

-- Mahasiswa hanya bisa melihat & edit data miliknya sendiri
CREATE POLICY "Students can view their own KP registration"
  ON public.kp_registrations
  FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own KP registration"
  ON public.kp_registrations
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own (if status submitted) KP registration"
  ON public.kp_registrations
  FOR UPDATE
  USING (auth.uid() = student_id AND status = 'submitted');

-- Koordinator KP bisa view & edit semua
CREATE POLICY "Coordinator can view all KP registrations"
  ON public.kp_registrations
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'coordinator'));

CREATE POLICY "Coordinator can update all KP registrations"
  ON public.kp_registrations
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'coordinator'));
