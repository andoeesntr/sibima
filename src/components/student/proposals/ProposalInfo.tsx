
import { Calendar, Clock, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProposalInfoProps {
  companyName?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  supervisor: {
    id: string;
    full_name: string;
    profile_image?: string;
  } | null;
  formatDate: (dateString: string) => string;
}

const ProposalInfo = ({ 
  companyName, 
  description, 
  createdAt, 
  updatedAt, 
  supervisor, 
  formatDate 
}: ProposalInfoProps) => {
  return (
    <div className="space-y-6">
      {companyName && (
        <div>
          <h3 className="font-medium mb-2">Nama Perusahaan</h3>
          <p className="text-gray-700">{companyName}</p>
        </div>
      )}

      {description && (
        <div>
          <h3 className="font-medium mb-2">Deskripsi Kerja Praktik</h3>
          <p className="text-gray-700 whitespace-pre-line">{description}</p>
        </div>
      )}

      <div>
        <h3 className="font-medium mb-2">Informasi Proposal</h3>
        <dl className="space-y-2">
          <div className="flex items-center">
            <dt className="w-40 flex items-center text-gray-600">
              <Calendar size={16} className="mr-2" /> Tanggal Pengajuan
            </dt>
            <dd>{formatDate(createdAt)}</dd>
          </div>
          
          {updatedAt && updatedAt !== createdAt && (
            <div className="flex items-center">
              <dt className="w-40 flex items-center text-gray-600">
                <Clock size={16} className="mr-2" /> Terakhir Diperbarui
              </dt>
              <dd>{formatDate(updatedAt)}</dd>
            </div>
          )}
          
          <div className="flex items-center">
            <dt className="w-40 flex items-center text-gray-600">
              <User size={16} className="mr-2" /> Dosen Pembimbing
            </dt>
            <dd className="flex items-center">
              {supervisor ? (
                <>
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={supervisor.profile_image || "/placeholder.svg"} alt={supervisor.full_name} />
                    <AvatarFallback>{supervisor.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {supervisor.full_name}
                </>
              ) : (
                <span className="text-gray-500">Belum ditentukan</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ProposalInfo;
