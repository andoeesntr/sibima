
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchStudentProposals } from '@/services/studentProposalService';
import ProposalForm from '@/components/student/proposal-submission/ProposalForm';
import TeamForm from '@/components/student/proposal-submission/TeamForm';
import DocumentUploadForm from '@/components/student/proposal-submission/DocumentUploadForm';
import useProposalSubmission from '@/components/student/proposal-submission/hooks/useProposalSubmission';

const ProposalSubmission = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get query params to check if we're editing an existing proposal
  const location = window.location;
  const params = new URLSearchParams(location.search);
  const editProposalId = params.get('edit');
  
  const {
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
    
    // Actions
    handleSubmit
  } = useProposalSubmission(editProposalId);

  // Check if user already has an approved proposal
  useEffect(() => {
    const checkApprovedProposal = async () => {
      if (!user || isEditMode) return;
      
      try {
        const proposals = await fetchStudentProposals(user.id);
        const hasApprovedProposal = proposals.some(p => p.status === 'approved');
        
        if (hasApprovedProposal) {
          toast.error('Anda sudah memiliki proposal yang disetujui. Tidak dapat mengajukan proposal baru.');
          navigate('/student');
          return;
        }
      } catch (error) {
        console.error('Error checking proposals:', error);
      }
    };

    checkApprovedProposal();
  }, [user, isEditMode, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <span className="ml-3">Memuat data proposal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {isEditMode ? 'Revisi Proposal KP' : 'Pengajuan Proposal KP'}
      </h1>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form">Formulir Proposal</TabsTrigger>
          <TabsTrigger value="team">Tim KP</TabsTrigger>
          <TabsTrigger value="upload">Upload Dokumen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="form">
          <ProposalForm
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            teamName={teamName}
            setTeamName={setTeamName}
            companyName={companyName}
            setCompanyName={setCompanyName}
            isEditMode={isEditMode}
            existingTeamId={existingTeamId}
            onNext={() => handleTabChange('team')}
            onCancel={() => navigate('/student')}
          />
        </TabsContent>
        
        <TabsContent value="team">
          <TeamForm
            teamMembers={teamMembers}
            setTeamMembers={setTeamMembers}
            selectedSupervisors={selectedSupervisors}
            setSelectedSupervisors={setSelectedSupervisors}
            students={students}
            supervisors={supervisors}
            isEditMode={isEditMode}
            existingTeamId={existingTeamId}
            onNext={() => handleTabChange('upload')}
            onBack={() => handleTabChange('form')}
          />
        </TabsContent>
        
        <TabsContent value="upload">
          <DocumentUploadForm
            file={file}
            setFile={setFile}
            isEditMode={isEditMode}
            existingDocumentId={existingDocumentId}
            isSubmitting={isSubmitting}
            onBack={() => handleTabChange('team')}
            onSubmit={handleSubmit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProposalSubmission;
