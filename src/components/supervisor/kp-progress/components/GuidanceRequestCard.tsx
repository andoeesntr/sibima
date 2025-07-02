
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, MessageSquare, User, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ProcessedGuidance {
  id: string;
  student_id: string;
  requested_date: string;
  location: string;
  topic: string;
  status: string;
  meeting_link: string;
  supervisor_notes: string;
  created_at: string;
  student_name: string;
  student_nim: string;
}

interface GuidanceRequestCardProps {
  request: ProcessedGuidance;
  onUpdateStatus: (requestId: string, status: string, notes?: string) => void;
}

const GuidanceRequestCard = ({ request, onUpdateStatus }: GuidanceRequestCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      requested: { label: 'Menunggu', className: 'bg-yellow-500' },
      approved: { label: 'Disetujui', className: 'bg-green-500' },
      rejected: { label: 'Ditolak', className: 'bg-red-500' },
      completed: { label: 'Selesai', className: 'bg-blue-500' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.requested;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy HH:mm', { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-4 w-4" />
              {request.student_name}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-1">
              <span>NIM: {request.student_nim}</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(request.requested_date)}
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(request.status)}
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Terjadwal
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {request.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{request.location}</span>
            </div>
          )}

          {request.topic && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-sm">Topik Bimbingan:</span>
              </div>
              <p className="text-sm text-gray-700 ml-6">{request.topic}</p>
            </div>
          )}

          {request.supervisor_notes && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-800">Catatan Anda:</h4>
              <p className="text-blue-700 text-sm whitespace-pre-wrap">{request.supervisor_notes}</p>
            </div>
          )}

          {request.status === 'requested' && (
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={() => onUpdateStatus(request.id, 'approved')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Setujui
              </Button>
              <Button 
                variant="destructive"
                onClick={() => onUpdateStatus(request.id, 'rejected')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Tolak
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 pt-2 border-t">
            Diajukan pada: {format(new Date(request.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuidanceRequestCard;
