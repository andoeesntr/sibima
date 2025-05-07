
interface RejectionInfoProps {
  status: string;
  rejectionReason: string | null | undefined;
}

const RejectionInfo = ({ status, rejectionReason }: RejectionInfoProps) => {
  if (status !== 'rejected' || !rejectionReason) {
    return null;
  }
  
  return (
    <div className="bg-red-50 border border-red-100 rounded-md p-4">
      <h3 className="font-medium text-red-800 mb-1">Alasan Penolakan</h3>
      <p className="text-red-700">{rejectionReason}</p>
    </div>
  );
};

export default RejectionInfo;
