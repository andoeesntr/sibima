
-- Hapus foreign key lama jika ada (opsional, aman untuk skip jika belum ada)
ALTER TABLE public.kp_registrations DROP CONSTRAINT IF EXISTS kp_registrations_student_id_fkey;

-- Tambahkan foreign key ke profiles.id agar Supabase mengenali relasinya
ALTER TABLE public.kp_registrations
  ADD CONSTRAINT kp_registrations_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles (id) ON DELETE CASCADE;
