
-- 1. Create storage bucket for KP Registrations
insert into storage.buckets (id, name, public)
values ('kp-registrations', 'kp-registrations', true);

-- 2. Set permissive RLS policies on storage.objects for kp-registrations bucket
-- Allow anyone to select/read files from this bucket
create policy "Public read access for kp-registrations"
on storage.objects
for select
using (bucket_id = 'kp-registrations');

-- Allow authenticated users to insert/upload files to this bucket
create policy "Authenticated can upload to kp-registrations"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'kp-registrations');

-- Allow authenticated users to update/delete their own uploads (optional, can adjust to your need)
create policy "Authenticated can update own files in kp-registrations"
on storage.objects
for update
to authenticated
using (bucket_id = 'kp-registrations' and auth.uid() = owner);

create policy "Authenticated can delete own files in kp-registrations"
on storage.objects
for delete
to authenticated
using (bucket_id = 'kp-registrations' and auth.uid() = owner);

