
interface ProposalMetadataProps {
  companyName: string | null;
  createdAt: string;
  updatedAt?: string | null;
  formatDate: (date: string | Date) => string;
}

const ProposalMetadata = ({ 
  companyName, 
  createdAt, 
  updatedAt,
  formatDate 
}: ProposalMetadataProps) => {
  return (
    <>
      {companyName && (
        <div>
          <h3 className="font-medium mb-2">Perusahaan/Instansi</h3>
          <p className="text-gray-700">{companyName}</p>
        </div>
      )}

      <div>
        <h3 className="font-medium mb-2">Tanggal Pengajuan</h3>
        <p className="text-gray-700">{formatDate(createdAt)}</p>
      </div>

      {updatedAt && (
        <div>
          <h3 className="font-medium mb-2">Terakhir Diperbarui</h3>
          <p className="text-gray-700">{formatDate(updatedAt)}</p>
        </div>
      )}
    </>
  );
};

export default ProposalMetadata;
