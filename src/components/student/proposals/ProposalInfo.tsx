
import { User } from 'lucide-react';

interface Supervisor {
  id: string;
  full_name: string;
  profile_image?: string;
}

interface ProposalInfoProps {
  companyName: string | null;
  description: string | null;
  createdAt: string;
  updatedAt?: string | null;
  supervisors?: Supervisor[];
  formatDate: (date: string | Date) => string;
}

const ProposalInfo = ({ 
  companyName, 
  description, 
  createdAt, 
  updatedAt, 
  supervisors,
  formatDate 
}: ProposalInfoProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">Deskripsi</h3>
        <p className="text-gray-700">{description || '-'}</p>
      </div>

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

      {supervisors && supervisors.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Dosen Pembimbing</h3>
          <div className="space-y-2">
            {supervisors.map((supervisor, index) => (
              <div 
                key={supervisor.id}
                className="flex items-center p-2 bg-gray-50 rounded"
              >
                <User size={16} className="mr-2" />
                <div className="font-medium">{supervisor.full_name}</div>
                <div className="ml-auto text-xs text-gray-500">Pembimbing {index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalInfo;
