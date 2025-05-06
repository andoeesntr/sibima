
import { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, X, FileUpload, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { 
  fetchAllGuidanceSessions, 
  GuidanceSession, 
  updateGuidanceSessionStatus 
} from '@/services/guidanceService';

const statusColors = {
  scheduled: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500'
};

const statusLabels = {
  scheduled: 'Terjadwal',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
};

interface GuidanceSessionsListProps {
  onAddSession?: () => void;
  onViewReport?: (session: GuidanceSession) => void;
}

const GuidanceSessionsList = ({ onAddSession, onViewReport }: GuidanceSessionsListProps) => {
  const [sessions, setSessions] = useState<GuidanceSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const data = await fetchAllGuidanceSessions();
    setSessions(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (sessionId: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    const success = await updateGuidanceSessionStatus(sessionId, status);
    if (success) {
      loadSessions();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sesi Bimbingan</h2>
        {onAddSession && (
          <Button onClick={onAddSession}>
            <Calendar className="mr-2 h-4 w-4" /> Jadwalkan Bimbingan
          </Button>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p>Loading...</p>
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Belum ada sesi bimbingan yang terjadwal.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {session.session_type === 'scheduled' ? 'Bimbingan Terjadwal' : 
                       session.session_type === 'final' ? 'Bimbingan Final' : 
                       'Bimbingan Reguler'}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(session.session_date), 'dd MMMM yyyy')}
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[session.status]}>
                    {statusLabels[session.status]}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Mahasiswa:</p>
                      <p className="font-medium">{session.student?.full_name || 'Unknown'}</p>
                      <p className="text-xs">{session.student?.nim || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dosen Pembimbing:</p>
                      <p className="font-medium">{session.supervisor?.full_name || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  {session.status === 'scheduled' && (
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleUpdateStatus(session.id, 'cancelled')}
                      >
                        <X className="mr-1 h-4 w-4" /> Batalkan
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleUpdateStatus(session.id, 'completed')}
                      >
                        <Check className="mr-1 h-4 w-4" /> Selesai
                      </Button>
                    </div>
                  )}
                  
                  {session.status === 'completed' && onViewReport && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => onViewReport(session)}
                    >
                      <FileUpload className="mr-1 h-4 w-4" /> Lihat Laporan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuidanceSessionsList;
