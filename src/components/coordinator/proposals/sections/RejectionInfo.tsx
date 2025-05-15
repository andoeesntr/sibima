
interface RejectionInfoProps {
  status: string;
  rejectionReason: string | null | undefined;
}

const RejectionInfo = ({ status, rejectionReason }: RejectionInfoProps) => {
  if (!rejectionReason) {
    return null;
  }
  
  if (status === 'rejected') {
    return (
      <div className="bg-red-50 border border-red-100 rounded-md p-4">
        <h3 className="font-medium text-red-800 mb-1">Alasan Penolakan</h3>
        <p className="text-red-700">{rejectionReason}</p>
      </div>
    );
  }
  
  if (status === 'revision' || (status === 'submitted' && rejectionReason)) {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-md p-4">
        <h3 className="font-medium text-amber-800 mb-1">Catatan Revisi</h3>
        <p className="text-amber-700">{rejectionReason}</p>
      </div>
    );
  }

  return null;
};

export default RejectionInfo;
