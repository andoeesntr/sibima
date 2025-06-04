
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

export const useProposalTeam = (initialMembers: Student[] = [], initialSupervisors: string[] = []) => {
  const [teamMembers, setTeamMembers] = useState<Student[]>(initialMembers);
  const [selectedSupervisors, setSelectedSupervisors] = useState<string[]>(initialSupervisors);
  const [students, setStudents] = useState<Student[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [teamStepValid, setTeamStepValid] = useState(false);
  
  // Update team validation state
  useEffect(() => {
    setTeamStepValid(teamMembers.length > 0 && selectedSupervisors.length > 0);
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
  
  return {
    teamMembers,
    setTeamMembers,
    selectedSupervisors,
    setSelectedSupervisors,
    students,
    supervisors,
    teamStepValid,
    fetchStudents,
    fetchSupervisors,
    addCurrentUserToTeam
  };
};

export default useProposalTeam;
