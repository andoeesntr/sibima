
import { useState, useEffect } from 'react';
import { ProcessedGuidance } from './useScheduledGuidanceData';

export const useGuidanceFilters = (guidanceRequests: ProcessedGuidance[]) => {
  const [filteredRequests, setFilteredRequests] = useState<ProcessedGuidance[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');

  const applyFilters = () => {
    let filtered = [...guidanceRequests];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (studentFilter !== 'all') {
      filtered = filtered.filter(request => request.student_id === studentFilter);
    }

    setFilteredRequests(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [statusFilter, studentFilter, guidanceRequests]);

  return {
    filteredRequests,
    statusFilter,
    setStatusFilter,
    studentFilter,
    setStudentFilter
  };
};
