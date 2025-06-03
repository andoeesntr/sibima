
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
  const [teamMembers, setTeamMembers] = useState<Student[]>([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState<string[]>(initialSupervisors);
  const [students, setStudents] = useState<Student[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [teamStepValid, setTeamStepValid] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Enhanced team validation with size checking
  useEffect(() => {
    const isValidTeamSize = teamMembers.length > 0 && teamMembers.length <= MAX_TEAM_SIZE;
    const hasValidSupervisors = selectedSupervisors.length > 0 && selectedSupervisors.length <= 2;
    
    setTeamStepValid(isValidTeamSize && hasValidSupervisors);
  }, [teamMembers, selectedSupervisors]);

  // Initialize team members properly - ensuring current user is first
  useEffect(() => {
    if (initialMembers.length > 0 && currentUserId) {
      // Find current user in initial members
      const currentUserMember = initialMembers.find(member => member.id === currentUserId);
      const otherMembers = initialMembers.filter(member => member.id !== currentUserId);
      
      // If current user exists in initial members, put them first
      if (currentUserMember) {
        const orderedMembers = [currentUserMember, ...otherMembers].slice(0, MAX_TEAM_SIZE);
        setTeamMembers(orderedMembers);
      } else {
        // If current user is not in initial members, we need to add them first
        console.warn('Current user not found in initial members, will be added when addCurrentUserToTeam is called');
      }
    }
  }, [initialMembers, currentUserId]);
  
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
    
    console.log('Adding current user to team:', userId);
    setCurrentUserId(userId);
    
    const currentUser = students.find(student => student.id === userId);
    if (currentUser) {
      // Always put current user as the first member (team leader/submitter)
      const existingMembers = teamMembers.filter(member => member.id !== userId);
      const newTeamMembers = [currentUser, ...existingMembers];
      console.log('Setting team members with current user first:', newTeamMembers);
      setTeamMembers(newTeamMembers);
    } else {
      // If student data hasn't loaded yet, fetch current user profile
      try {
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('id, full_name, nim')
          .eq('id', userId)
          .single();
          
        if (!error && userProfile) {
          const existingMembers = teamMembers.filter(member => member.id !== userId);
          const newTeamMembers = [userProfile, ...existingMembers];
          console.log('Setting team members with fetched user first:', newTeamMembers);
          setTeamMembers(newTeamMembers);
        }
      } catch (error) {
        console.error('Error fetching current user profile:', error);
      }
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
    
    // Ensure current user is always first if they exist in the members
    if (currentUserId && members.length > 0) {
      const currentUserMember = members.find(member => member.id === currentUserId);
      if (currentUserMember) {
        const otherMembers = members.filter(member => member.id !== currentUserId);
        const orderedMembers = [currentUserMember, ...otherMembers];
        setTeamMembers(orderedMembers);
        console.log(`Team members updated with current user first. New count: ${orderedMembers.length}/${MAX_TEAM_SIZE}`);
        return;
      }
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
