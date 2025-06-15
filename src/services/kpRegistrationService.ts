
import { supabase } from "@/integrations/supabase/client";

// Fetch all lecturers (role 'lecturer' OR 'dosen' or 'coordinator' if not available)
export async function fetchLecturers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["lecturer", "dosen", "coordinator"]);

  if (error) throw error;
  return data;
}

// Submit KP registration form
export async function submitKpRegistration(form: any) {
  const { data, error } = await supabase
    .from("kp_registrations")
    .insert([form])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Upload file and return url
export async function uploadKpFile(file: File, folder: string) {
  const filePath = `${folder}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from("kp-registration-files")
    .upload(filePath, file, { upsert: true });

  if (error) throw error;
  return data?.path
    ? supabase.storage.from("kp-registration-files").getPublicUrl(data.path).data.publicUrl
    : null;
}
