
import SupervisorList from './SupervisorList';
import DocumentList from './DocumentList';

interface DetailSectionProps {
  description: string;
  rejectionReason?: string;
  status: string;
  teamId?: string;
  teamName?: string;
  supervisors?: {
    id: string;
    full_name: string;
    profile_image?: string;
  }[];
  documents?: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType?: string;
  }[];
  handlePreviewFile: (url: string) => void;
  handleDownloadFile: (url: string, fileName: string) => void;
}

const DetailSection = ({
  description,
  rejectionReason,
  status,
  teamId,
  teamName,
  supervisors = [],
  documents = [],
  handlePreviewFile,
  handleDownloadFile
}: DetailSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">Deskripsi</h3>
        <p className="text-gray-600">{description || 'Tidak ada deskripsi'}</p>
      </div>
      
      {rejectionReason && status === 'rejected' && (
        <div className="bg-red-50 border border-red-100 rounded-md p-4">
          <h3 className="font-medium text-red-800 mb-1">Alasan Penolakan</h3>
          <p className="text-red-700">{rejectionReason}</p>
        </div>
      )}
      
      {teamId && (
        <div>
          <h3 className="font-medium mb-2">Tim KP</h3>
          <p className="text-gray-600">{teamName || 'Tim KP'}</p>
        </div>
      )}
      
      <div>
        <h3 className="font-medium mb-2">Pembimbing</h3>
        <SupervisorList supervisors={supervisors} />
      </div>
      
      <div>
        <h3 className="font-medium mb-2">Dokumen</h3>
        <DocumentList 
          documents={documents} 
          handlePreviewFile={handlePreviewFile}
          handleDownloadFile={handleDownloadFile}
        />
      </div>
    </div>
  );
};

export default DetailSection;
