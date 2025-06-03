
interface RejectionMessageProps {
  rejectionReason: string;
}

const RejectionMessage = ({ rejectionReason }: RejectionMessageProps) => {
  if (!rejectionReason) return null;
  
  return (
    <div className="bg-red-50 border border-red-100 rounded-md p-4">
      <h3 className="font-medium text-red-800 mb-1">Alasan Penolakan</h3>
      <p className="text-red-700 whitespace-pre-line">{rejectionReason}</p>
    </div>
  );
};

export default RejectionMessage;
