
import { useState, useEffect } from 'react';

interface UseProposalFormReturn {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  teamName: string;
  setTeamName: (teamName: string) => void;
  companyName: string;
  setCompanyName: (companyName: string) => void;
  formStepValid: boolean;
}

export const useProposalForm = (initialTitle = '', initialDescription = '', initialTeamName = '', initialCompanyName = '') => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [teamName, setTeamName] = useState(initialTeamName);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  
  const [formStepValid, setFormStepValid] = useState(false);
  
  // Update form validation state
  useEffect(() => {
    setFormStepValid(!!title && !!description && !!teamName && !!companyName);
  }, [title, description, teamName, companyName]);
  
  return {
    title, setTitle,
    description, setDescription,
    teamName, setTeamName,
    companyName, setCompanyName,
    formStepValid
  };
};

export default useProposalForm;
