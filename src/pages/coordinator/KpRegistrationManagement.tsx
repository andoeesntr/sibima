import React from "react";
import FormBuilder from "@/components/coordinator/kp-registration/FormBuilder";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import KpRegistrationCard from "@/components/coordinator/kp-registration/KpRegistrationCard";
import KpRegistrationCardEditDialog from "@/components/coordinator/kp-registration/KpRegistrationCardEditDialog";
import { toast } from "sonner";

export type RegistrationRow = {
  id: string;
  student: { full_name: string; nim: string };
  student_id: string;
  semester: number;
  guardian_lecturer_id?: string | null;
  registration_status: string;
  ipk: number;
  total_completed_credits: number;
  total_d_e_credits: number;
  d_e_courses?: string | null;
  total_current_credits: number;
  total_credits: number;
  last_gpa_file?: string | null;
  last_krs_file?: string | null;
  status: string;
  notes?: string | null;
};

const fetchRegistrations = async (): Promise<RegistrationRow[]> => {
  const { data, error } = await supabase
    .from("kp_registrations")
    .select(`
      id,
      student_id,
      semester,
      guardian_lecturer_id,
      registration_status,
      ipk,
      total_completed_credits,
      total_d_e_credits,
      d_e_courses,
      total_current_credits,
      total_credits,
      last_gpa_file,
      last_krs_file,
      status,
      notes,
      student:profiles!kp_registrations_student_id (full_name, nim)
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((row: any) => {
    let student = row.student;
    if (
      !student ||
      typeof student !== "object" ||
      typeof student.full_name !== "string" ||
      typeof student.nim !== "string"
    ) {
      student = { full_name: "-", nim: "-" };
    }
    return { ...row, student };
  });
};

function filterWritableFields(fields: Partial<RegistrationRow>) {
  // exclude non-table and join fields
  const {
    student, // joined
    id, // taken separately
    ...rest
  } = fields;
  // Only allowed table fields
  const allowed = [
    "student_id", "semester", "guardian_lecturer_id", "registration_status", "ipk", "total_completed_credits",
    "total_d_e_credits", "d_e_courses", "total_current_credits", "total_credits",
    "last_gpa_file", "last_krs_file", "status", "notes"
  ];
  // Remove any keys not in allowed, and ensure ipk and other NOT NULLs are always sent for update/insert
  let result: any = {};
  for (const k of allowed) {
    if (fields[k as keyof typeof fields] !== undefined) {
      result[k] = fields[k as keyof typeof fields];
    }
  }
  return result;
}

export default function KpRegistrationManagement() {
  // For now, show the form builder as the main panel
  return (
    <div className="p-8">
      <FormBuilder />
    </div>
  );
}
