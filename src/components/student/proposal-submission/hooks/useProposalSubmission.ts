import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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

export const useProposalSubmission = (editProposalId: string | null) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isEditMode = !!editProposalId;
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamName, setTeamName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedSupervisors, setSelectedSupervisors] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<Student[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data for select options
  const [students, setStudents] = useState<Student[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  
  // For edit mode
  const [existingTeamId, setExistingTeamId] = useState<string | null>(null);
  const [existingDocumentId, setExistingDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  
  // Form validation
  const [formStepValid, setFormStepValid] = useState(false);
  const [teamStepValid, setTeamStepValid] = useState(false);
  
  // Load existing proposal data if in edit mode
  useEffect(() => {
    const loadExistingProposal = async () => {
      if (!editProposalId || !user) return;
      
      setIsLoading(true);
      try {
        // Fetch proposal details
        const { data: proposalData, error: proposalError } = await supabase
          .from('proposals')
          .select(`
            id, title, description, company_name, team_id, supervisor_id, 
            team:team_id (id, name)
          `)
          .eq('id', editProposalId)
          .single();

        if (proposalError) {
          throw proposalError;
        }

        if (proposalData) {
          // Set form data
          setTitle(proposalData.title || '');
          setDescription(proposalData.description || '');
          setCompanyName(proposalData.company_name || '');
          setExistingTeamId(proposalData.team_id);
          
          if (proposalData.supervisor_id) {
            setSelectedSupervisors([proposalData.supervisor_id]);
          }
          
          if (proposalData.team_id) {
            setTeamName(proposalData.team?.name || '');
            
            // Fetch team members
            const { data: teamMembersData, error: teamMembersError } = await supabase
              .from('team_members')
              .select(`
                user_id,
                user:user_id (id, full_name, nim)
              `)
              .eq('team_id', proposalData.team_id);
              
            if (!teamMembersError && teamMembersData) {
              const members: Student[] = teamMembersData.map(item => ({
                id: item.user?.id || item.user_id,
                full_name: item.user?.full_name || 'Unknown',
                nim: item.user?.nim
              }));
              setTeamMembers(members);
            }
            
            // Fetch team supervisors
            const { data: teamSupervisorsData, error: teamSupervisorsError } = await supabase
              .from('team_supervisors')
              .select('supervisor_id')
              .eq('team_id', proposalData.team_id);
              
            if (!teamSupervisorsError && teamSupervisorsData) {
              const supervisorIds = teamSupervisorsData.map(item => item.supervisor_id);
              setSelectedSupervisors(supervisorIds);
            }
          }
          
          // Fetch proposal documents
          const { data: documentData, error: documentError } = await supabase
            .from('proposal_documents')
            .select('id, file_name')
            .eq('proposal_id', editProposalId)
            .order('uploaded_at', { ascending: false })
            .limit(1);
            
          if (!documentError && documentData && documentData.length > 0) {
            setExistingDocumentId(documentData[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading proposal data:', error);
        toast.error('Gagal memuat data proposal');
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchStudents = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, nim')
          .eq('role', 'student');
          
        if (error) throw error;
        
        if (data) {
          setStudents(data);
          
          // Add current user to team members if not editing
          if (!isEditMode && user) {
            const currentUser = data.find(student => student.id === user.id);
            if (currentUser) {
              setTeamMembers([currentUser]);
            }
          }
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
    
    if (isEditMode) {
      loadExistingProposal();
    }
    
    fetchStudents();
    fetchSupervisors();
  }, [editProposalId, user, isEditMode]);
  
  // Update form validation states
  useEffect(() => {
    setFormStepValid(!!title && !!description && !!teamName && !!companyName);
  }, [title, description, teamName, companyName]);

  useEffect(() => {
    setTeamStepValid(teamMembers.length > 0 && selectedSupervisors.length > 0);
  }, [teamMembers, selectedSupervisors]);
  
  const handleTabChange = (value: string) => {
    // From Form to another tab
    if (activeTab === 'form' && (value === 'team' || value === 'upload')) {
      if (!formStepValid) {
        toast.error('Harap isi semua bidang yang diperlukan pada Formulir Proposal');
        return;
      }
    }
    
    // From Team to Upload
    if (activeTab === 'team' && value === 'upload') {
      if (!teamStepValid) {
        toast.error('Harap pilih minimal satu dosen pembimbing dan pastikan tim memiliki anggota');
        return;
      }
    }
    
    // Always allow backward navigation
    if ((activeTab === 'team' && value === 'form') || 
        (activeTab === 'upload' && (value === 'form' || value === 'team'))) {
      setActiveTab(value);
      return;
    }
    
    // Allow navigation if current step is valid
    if ((activeTab === 'form' && value === 'team' && formStepValid) ||
        (activeTab === 'team' && value === 'upload' && teamStepValid)) {
      setActiveTab(value);
    }
  };

  const handleSubmit = async () => {
    if (!formStepValid || !teamStepValid || (!file && !isEditMode)) {
      toast.error(isEditMode && !file 
        ? 'Harap isi semua bidang yang diperlukan. File dokumen baru opsional untuk revisi' 
        : 'Harap isi semua bidang yang diperlukan');
      return;
    }

    if (selectedSupervisors.length > 2) {
      toast.error('Maksimal 2 dosen pembimbing');
      return;
    }

    if (!user || !profile) {
      toast.error('Anda harus login untuk mengajukan proposal');
      return;
    }

    setIsSubmitting(true);

    try {
      let teamId = existingTeamId;
      
      // If editing and team exists, update team
      if (isEditMode && existingTeamId) {
        // Update team name if changed
        const { error: teamUpdateError } = await supabase
          .from('teams')
          .update({ name: teamName, updated_at: new Date().toISOString() })
          .eq('id', existingTeamId);
          
        if (teamUpdateError) {
          throw teamUpdateError;
        }
      } else {
        // Create team if doesn't exist
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .insert({ name: teamName })
          .select('id')
          .single();

        if (teamError) {
          throw teamError;
        }
        
        teamId = teamData.id;
        
        // Add team members
        const teamMembersToInsert = teamMembers.map(member => ({
          team_id: teamData.id,
          user_id: member.id,
          role: member.id === user.id ? 'leader' : 'member'
        }));

        const { error: memberError } = await supabase
          .from('team_members')
          .insert(teamMembersToInsert);

        if (memberError) {
          throw memberError;
        }
      }

      let proposalId = editProposalId;
      
      if (isEditMode && editProposalId) {
        // Update existing proposal
        const { error: proposalUpdateError } = await supabase
          .from('proposals')
          .update({
            title,
            description,
            company_name: companyName,
            supervisor_id: selectedSupervisors[0],
            status: 'submitted', // Reset to submitted after revision
            rejection_reason: null, // Clear previous rejection reason
            updated_at: new Date().toISOString()
          })
          .eq('id', editProposalId);
          
        if (proposalUpdateError) {
          throw proposalUpdateError;
        }
      } else {
        // Create new proposal
        const { data: proposalData, error: proposalError } = await supabase
          .from('proposals')
          .insert({
            student_id: user.id,
            title,
            description,
            company_name: companyName,
            supervisor_id: selectedSupervisors[0],
            status: 'submitted',
            team_id: teamId
          })
          .select();

        if (proposalError) {
          throw proposalError;
        }
        
        proposalId = proposalData[0].id;
      }

      // Upload new file if provided
      if (file && proposalId) {
        const fileName = `${Date.now()}_${file.name}`;
        const fileExt = fileName.split('.').pop();
        const filePath = `${user.id}/${proposalId}/${fileName}`;

        // If we're in edit mode, delete the old documents before uploading the new one
        if (isEditMode && existingDocumentId) {
          // First, get the file URL of the existing document to delete from storage
          const { data: existingDoc, error: fetchError } = await supabase
            .from('proposal_documents')
            .select('file_url')
            .eq('id', existingDocumentId)
            .single();
          
          if (fetchError) {
            console.error("Error fetching existing document:", fetchError);
            // Continue with upload even if fetch fails
          } else if (existingDoc) {
            // Extract the path from the URL
            try {
              const url = new URL(existingDoc.file_url);
              const storagePath = url.pathname.split('/').slice(3).join('/'); // Remove /storage/v1/object/public/ prefix
              
              // Delete the file from storage
              const { error: storageDeleteError } = await supabase.storage
                .from('proposal-documents')
                .remove([storagePath]);
                
              if (storageDeleteError) {
                console.error("Error deleting file from storage:", storageDeleteError);
                // Continue with upload even if delete fails
              }
            } catch (e) {
              console.error("Error parsing file URL:", e);
              // Continue with upload even if parse fails
            }
          }

          // Delete the old document record from the database
          const { error: deleteError } = await supabase
            .from('proposal_documents')
            .delete()
            .eq('id', existingDocumentId);

          if (deleteError) {
            console.error("Error deleting old document record:", deleteError);
            // Continue with upload even if delete fails
          }
        }

        // Upload the new file
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('proposal-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL for the uploaded file
        const { data: publicURLData } = supabase.storage
          .from('proposal-documents')
          .getPublicUrl(filePath);

        if (!publicURLData.publicUrl) {
          throw new Error('Failed to get public URL for uploaded file');
        }

        // Add document record in the database
        const { error: documentError } = await supabase
          .from('proposal_documents')
          .insert({
            proposal_id: proposalId,
            file_name: fileName,
            file_url: publicURLData.publicUrl,
            file_type: fileExt,
            uploaded_by: user.id
          });

        if (documentError) {
          throw documentError;
        }
      }

      await supabase.from('activity_logs').insert({
        user_id: user.id,
        user_name: profile.full_name || user.email,
        action: isEditMode ? 'revised' : 'submitted',
        target_type: 'proposal',
        target_id: proposalId
      });

      toast.success(isEditMode 
        ? 'Revisi proposal berhasil dikirim' 
        : 'Proposal berhasil diajukan');
      navigate('/student');
    } catch (error: any) {
      console.error('Error submitting proposal:', error);
      toast.error(`Gagal ${isEditMode ? 'merevisi' : 'mengajukan'} proposal: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Form data
    title, setTitle,
    description, setDescription,
    teamName, setTeamName,
    companyName, setCompanyName,
    selectedSupervisors, setSelectedSupervisors,
    teamMembers, setTeamMembers,
    file, setFile,
    
    // UI state
    activeTab, 
    handleTabChange,
    isSubmitting,
    isLoading,
    
    // Reference data
    students,
    supervisors,
    
    // Edit mode data
    isEditMode,
    existingTeamId,
    existingDocumentId,
    
    // Form validation
    formStepValid,
    teamStepValid,
    
    // Actions
    handleSubmit
  };
};

export default useProposalSubmission;
