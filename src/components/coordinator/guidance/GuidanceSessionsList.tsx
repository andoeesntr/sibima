
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GuidanceSession } from '@/services/guidanceService';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Calendar, FileText, Plus } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';

interface GuidanceSessionsListProps {
  onAddSession: () => void;
  onViewReport: (session: GuidanceSession) => void;
}

const GuidanceSessionsList = ({ onAddSession, onViewReport }: GuidanceSessionsListProps) => {
  // Sample data - would typically be fetched from API
  const [sessions] = useState<GuidanceSession[]>([
    {
      id: '1',
      student_id: 'student1',
      supervisor_id: 'supervisor1',
      session_date: '2023-05-15T10:00:00Z',
      session_type: 'Proposal Review',
      status: 'completed',
      student: {
        full_name: 'Budi Santoso',
        nim: '12345678'
      },
      supervisor: {
        full_name: 'Dr. Ahmad Wijaya'
      }
    },
    {
      id: '2',
      student_id: 'student2',
      supervisor_id: 'supervisor2',
      session_date: '2023-05-20T14:00:00Z',
      session_type: 'Progress Update',
      status: 'scheduled',
      student: {
        full_name: 'Siti Rahma',
        nim: '87654321'
      },
      supervisor: {
        full_name: 'Dr. Kartika Dewi'
      }
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Scheduled</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Daftar Sesi Bimbingan</h2>
        <Button onClick={onAddSession}>
          <Plus className="mr-2 h-4 w-4" />
          Jadwalkan Bimbingan
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mahasiswa</TableHead>
            <TableHead>Pembimbing</TableHead>
            <TableHead>Tanggal & Waktu</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                Belum ada sesi bimbingan yang dijadwalkan
              </TableCell>
            </TableRow>
          ) : (
            sessions.map(session => (
              <TableRow key={session.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{session.student?.full_name.charAt(0) || 'S'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{session.student?.full_name}</div>
                      <div className="text-xs text-gray-500">{session.student?.nim}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{session.supervisor?.full_name}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(new Date(session.session_date))}</span>
                  </div>
                </TableCell>
                <TableCell>{session.session_type}</TableCell>
                <TableCell>{getStatusBadge(session.status)}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onViewReport(session)}
                    disabled={session.status !== 'completed'}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default GuidanceSessionsList;
