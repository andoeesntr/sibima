
-- Membuat storage bucket untuk file pendaftaran KP (agar upload file tidak error)
insert into storage.buckets (id, name, public) values ('kp-registration-files', 'kp-registration-files', true);

-- Mengatur bucket agar publik (boleh dibaca publik)
-- Kebijakan publik:
insert into storage.objects (bucket_id, name, owner, created_at, updated_at, last_accessed_at)
select 'kp-registration-files', '', null, now(), now(), now()
on conflict do nothing;

-- Policy: semua orang bisa upload dan baca file (supaya upload form berjalan)
-- Baca
create policy "Public read kp-registration-files"
  on storage.objects for select
  using (bucket_id = 'kp-registration-files');

-- Upload
create policy "Public upload kp-registration-files"
  on storage.objects for insert
  with check (bucket_id = 'kp-registration-files');
