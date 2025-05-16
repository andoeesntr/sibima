
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import useProposalForm from './useProposalForm';
import useProposalTeam from './useProposalTeam';
import useProposalDocument from './useProposalDocument';
import { fetchExistingProposal } from '../services/proposalService';
import { handleProposalSubmission } from '../services/proposalSubmissionService';

export const useProposalSubmission = (editProposalId: string | null) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isEditMode = !!editProposalId;
  
  // UI state
  const [activeTab, setActiveTab] = useState('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  
  // Form state from custom hooks
  const [existingTeamId, setExistingTeamId] = useState<string | null>(null);
  
  const {
    title, setTitle,
    description, setDescription,
    teamName, setTeamName,
    companyName, setCompanyName,
    formStepValid
  } = useProposalForm();
  
  const {
    teamMembers, setTeamMembers,
    selectedSupervisors, setSelectedSupervisors,
    students, supervisors,
    teamStepValid,
    fetchStudents, fetchSupervisors,
    addCurrentUserToTeam
  } = useProposalTeam();
  
  const {
    file, setFile,
    existingDocumentId, setExistingDocumentId
  } = useProposalDocument();
  
  // Load existing proposal data if in edit mode
  useEffect(() => {
    const loadData = async () => {
      if (!editProposalId || !user) return;
      
      setIsLoading(true);
      try {
        const proposalData = await fetchExistingProposal(editProposalId);
        
        if (proposalData) {
          // Set form data
          setTitle(proposalData.title || '');
          setDescription(proposalData.description || '');
          setCompanyName(proposalData.company_name || '');
          setExistingTeamId(proposalData.team_id);
          setTeamName(proposalData.team?.name || '');
          
          if (proposalData.supervisor_id) {
            setSelectedSupervisors([proposalData.supervisor_id]);
          }
          
          // Set team members
          if (proposalData.teamMembers) {
            setTeamMembers(proposalData.teamMembers);
          }
          
          // Set document info
          if (proposalData.documentId) {
            setExistingDocumentId(proposalData.documentId);
          }
        }
      } catch (error) {
        console.error('Error loading proposal data:', error);
        toast.error('Gagal memuat data proposal');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Load reference data and existing proposal if needed
    const initializeData = async () => {
      await Promise.all([
        fetchStudents(), 
        fetchSupervisors()
      ]);
      
      if (isEditMode) {
        await loadData();
      } else if (user) {
        await addCurrentUserToTeam(user.id);
      }
    };
    
    initializeData();
  }, [editProposalId, user, isEditMode]);
  
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
      await handleProposalSubmission({
        user,
        profile,
        isEditMode,
        proposalId: editProposalId,
        existingTeamId,
        existingDocumentId,
        title,
        description,
        teamName,
        companyName,
        teamMembers,
        selectedSupervisors,
        file
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
