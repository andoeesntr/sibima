
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, User } from 'lucide-react';

interface UniqueStudent {
  id: string;
  name: string;
  nim: string;
}

interface GuidanceFiltersProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  studentFilter: string;
  setStudentFilter: (studentId: string) => void;
  uniqueStudents: UniqueStudent[];
}

const GuidanceFilters = ({
  statusFilter,
  setStatusFilter,
  studentFilter,
  setStudentFilter,
  uniqueStudents
}: GuidanceFiltersProps) => {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Status
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {statusFilter === 'requested' ? 'Menunggu' : 
                 statusFilter === 'approved' ? 'Disetujui' : 
                 statusFilter === 'rejected' ? 'Ditolak' : 'Selesai'}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setStatusFilter('all')}>
            Semua Status
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter('requested')}>
            Menunggu
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter('approved')}>
            Disetujui
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>
            Ditolak
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
            Selesai
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <User className="h-4 w-4" />
            Mahasiswa
            {studentFilter !== 'all' && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {uniqueStudents.find(s => s.id === studentFilter)?.name}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem onClick={() => setStudentFilter('all')}>
            Semua Mahasiswa
          </DropdownMenuItem>
          {uniqueStudents.map((student) => (
            <DropdownMenuItem key={student.id} onClick={() => setStudentFilter(student.id)}>
              {student.name} ({student.nim})
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default GuidanceFilters;
