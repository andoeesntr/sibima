
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  full_name: string;
  nim?: string;
}

interface Supervisor {
  id: string;
  full_name: string;
}

interface UseProposalTeamReturn {
  teamMembers: Student[];
  setTeamMembers: (members: Student[]) => void;
  selectedSupervisors: string[];
  setSelectedSupervisors: (supervisors: string[]) => void;
  students: Student[];
  supervisors: Supervisor[];
  teamStepValid: boolean;
  fetchStudents: () => Promise<void>;
  fetchSupervisors: () => Promise<void>;
  addCurrentUserToTeam: (userId: string) => Promise<void>;
}

const MAX_TEAM_SIZE = 4;

export const useProposalTeam = (initialMembers: Student[] = [], initialSupervisors: string[] = []) => {
  // Ensure initial members don't exceed the limit
  const validInitialMembers = initialMembers.slice(0, MAX_TEAM_SIZE);
  if (initialMembers.length > MAX_TEAM_SIZE) {
    console.warn(`Initial team members (${initialMembers.length}) exceed maximum (${MAX_TEAM_SIZE}). Truncating to ${MAX_TEAM_SIZE} members.`);
    toast.warning(`Tim awal melebihi batas maksimal ${MAX_TEAM_SIZE} orang. Hanya ${MAX_TEAM_SIZE} anggota pertama yang akan digunakan.`);
  }

  const [teamMembers, setTeamMembers] = useState<Student[]>(validInitialMembers);
  const [selectedSupervisors, setSelectedSupervisors] = useState<string[]>(initialSupervisors);
  const [students, setStudents] = useState<Student[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [teamStepValid, setTeamStepValid] = useState(false);
  
  // Enhanced team validation with size checking
  useEffect(() => {
    const isValidTeamSize = teamMembers.length > 0 && teamMembers.length <= MAX_TEAM_SIZE;
    const hasValidSupervisors = selectedSupervisors.length > 0 && selectedSupervisors.length <= 2;
    
    setTeamStepValid(isValidTeamSize && hasValidSupervisors);
  }, [teamMembers, selectedSupervisors]);
  
  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, nim')
        .eq('role', 'student');
        
      if (error) throw error;
      
      if (data) {
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };
  
  const fetchSupervisors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'supervisor');
        
      if (error) throw error;
      
      if (data) {
        setSupervisors(data);
      }
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    }
  };
  
  const addCurrentUserToTeam = async (userId: string) => {
    if (!userId) return;
    
    const currentUser = students.find(student => student.id === userId);
    if (currentUser && teamMembers.length === 0) {
      setTeamMembers([currentUser]);
    }
  };

  // Enhanced setTeamMembers with strict validation - submitter counts as 1 member
  const setTeamMembersWithValidation = (members: Student[]) => {
    console.log(`Attempting to set team members. Current: ${teamMembers.length}, New: ${members.length}, Max: ${MAX_TEAM_SIZE}`);
    
    if (members.length > MAX_TEAM_SIZE) {
      const currentSubmitter = members[0] ? members[0].full_name : 'Anda';
      toast.error(`Tim tidak boleh melebihi ${MAX_TEAM_SIZE} anggota total (termasuk ${currentSubmitter} sebagai pengaju). Saat ini ada ${members.length} anggota.`);
      return;
    }
    
    setTeamMembers(members);
    console.log(`Team members updated successfully. New count: ${members.length}/${MAX_TEAM_SIZE}`);
  };

  // Enhanced setSelectedSupervisors with validation
  const setSelectedSupervisorsWithValidation = (supervisors: string[]) => {
    if (supervisors.length > 2) {
      toast.error('Maksimal 2 dosen pembimbing');
      return;
    }
    setSelectedSupervisors(supervisors);
  };
  
  return {
    teamMembers,
    setTeamMembers: setTeamMembersWithValidation,
    selectedSupervisors,
    setSelectedSupervisors: setSelectedSupervisorsWithValidation,
    students,
    supervisors,
    teamStepValid,
    fetchStudents,
    fetchSupervisors,
    addCurrentUserToTeam
  };
};

export default useProposalTeam;
