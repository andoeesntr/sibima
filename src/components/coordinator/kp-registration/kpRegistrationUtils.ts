
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

export function filterWritableFields(fields: Partial<RegistrationRow>) {
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
  let result: any = {};
  for (const k of allowed) {
    if (fields[k as keyof typeof fields] !== undefined) {
      result[k] = fields[k as keyof typeof fields];
    }
  }
  return result;
}
