
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from 'lucide-react';

interface ProposalListItemProps {
  proposal: {
    id: string;
    title: string;
    submissionDate: string;
    status: string;
    studentName?: string;
    created_at?: string;
  };
  isSelected: boolean;
  formatDate: (date: string) => string;
  onClick: () => void;
}

const ProposalListItem = ({ proposal, isSelected, formatDate, onClick }: ProposalListItemProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'revision':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Diajukan';
      case 'revision':
        return 'Revisi';
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  // Use submissionDate or created_at for upload time
  const uploadTime = proposal.submissionDate || proposal.created_at;

  // Enhanced date formatting with time
  const formatDateWithTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card 
      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm line-clamp-2">{proposal.title}</h3>
            <Badge className={`text-xs ${getStatusColor(proposal.status)}`}>
              {getStatusLabel(proposal.status)}
            </Badge>
          </div>
          
          {proposal.studentName && (
            <p className="text-sm text-gray-600">
              Mahasiswa: {proposal.studentName}
            </p>
          )}
          
          {uploadTime && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Upload: {formatDateWithTime(uploadTime)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalListItem;
