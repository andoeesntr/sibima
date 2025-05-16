
import { useState } from 'react';

interface UseProposalDocumentReturn {
  file: File | null;
  setFile: (file: File | null) => void;
  existingDocumentId: string | null;
  setExistingDocumentId: (id: string | null) => void;
}

export const useProposalDocument = (initialDocumentId: string | null = null) => {
  const [file, setFile] = useState<File | null>(null);
  const [existingDocumentId, setExistingDocumentId] = useState<string | null>(initialDocumentId);
  
  return {
    file, 
    setFile,
    existingDocumentId,
    setExistingDocumentId
  };
};

export default useProposalDocument;
