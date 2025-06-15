
-- Table for form fields/questions (configurable by coordinator)
create table public.kp_form_fields (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  field_type text not null check (field_type in ('text','number','textarea','select','file')),
  field_key text not null unique, -- for mapping responses
  required boolean not null default false,
  order_index integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Table for dropdown/select options per field (for fields with type=select)
create table public.kp_form_options (
  id uuid primary key default gen_random_uuid(),
  field_id uuid references public.kp_form_fields(id) on delete cascade,
  value text not null,
  label text not null,
  order_index integer not null default 0
);

-- OPTIONAL: Enable RLS, only admins/koordinator can modify form structure
alter table public.kp_form_fields enable row level security;
alter table public.kp_form_options enable row level security;

-- Allow only admins/koordinator to view/modify (you may want to tune these!)
create policy "allow all for now" on public.kp_form_fields for all using (true) with check (true);
create policy "allow all for now" on public.kp_form_options for all using (true) with check (true);

