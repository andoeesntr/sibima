
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
  // Only show the most recent document
  const displayDocuments = documents.length > 0 ? [documents[0]] : [];
  
  // Ensure supervisors are displayed correctly
  console.log("Supervisors in DetailSection:", supervisors);
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-1">Deskripsi</h3>
        <p className="text-gray-600 text-sm line-clamp-3">{description || 'Tidak ada deskripsi'}</p>
      </div>
      
      {rejectionReason && status === 'rejected' && (
        <div className="bg-red-50 border border-red-100 rounded-md p-3">
          <h3 className="font-medium text-red-800 mb-1 text-sm">Alasan Penolakan</h3>
          <p className="text-red-700 text-sm">{rejectionReason}</p>
        </div>
      )}
      
      {teamId && (
        <div>
          <h3 className="font-medium mb-1 text-sm">Tim KP</h3>
          <p className="text-gray-600 text-sm">{teamName || 'Tim KP'}</p>
        </div>
      )}
      
      <div>
        <h3 className="font-medium mb-1 text-sm">Pembimbing</h3>
        <SupervisorList supervisors={supervisors} />
      </div>
      
      <div>
        <h3 className="font-medium mb-1 text-sm">Dokumen</h3>
        <DocumentList 
          documents={displayDocuments} 
          handlePreviewFile={handlePreviewFile}
          handleDownloadFile={handleDownloadFile}
        />
      </div>
    </div>
  );
};

export default DetailSection;
