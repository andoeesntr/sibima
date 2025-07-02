
import GuidanceFilters from './components/GuidanceFilters';
import GuidanceRequestCard from './components/GuidanceRequestCard';
import GuidanceEmptyState from './components/GuidanceEmptyState';
import { useScheduledGuidanceData } from '@/hooks/useScheduledGuidanceData';
import { useGuidanceFilters } from '@/hooks/useGuidanceFilters';

const SupervisorScheduledGuidance = () => {
  const { 
    guidanceRequests, 
    loading, 
    updateRequestStatus,
    getUniqueStudents 
  } = useScheduledGuidanceData();

  const {
    filteredRequests,
    statusFilter,
    setStatusFilter,
    studentFilter,
    setStudentFilter
  } = useGuidanceFilters(guidanceRequests);

  const uniqueStudents = getUniqueStudents();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Bimbingan Terjadwal (Wajib)</h2>
          <p className="text-gray-600">Kelola 2 sesi bimbingan terjadwal yang diwajibkan</p>
        </div>

        <GuidanceFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          studentFilter={studentFilter}
          setStudentFilter={setStudentFilter}
          uniqueStudents={uniqueStudents}
        />
      </div>

      {filteredRequests.length === 0 ? (
        <GuidanceEmptyState hasAnyRequests={guidanceRequests.length > 0} />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Menampilkan {filteredRequests.length} dari {guidanceRequests.length} permintaan
            </p>
          </div>
          
          {filteredRequests.map((request) => (
            <GuidanceRequestCard
              key={request.id}
              request={request}
              onUpdateStatus={updateRequestStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SupervisorScheduledGuidance;
