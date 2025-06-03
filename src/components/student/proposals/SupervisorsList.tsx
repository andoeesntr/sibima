
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Supervisor } from '@/services/supervisorService';

interface SupervisorsListProps {
  supervisors: Supervisor[];
}

const SupervisorsList = ({ supervisors }: SupervisorsListProps) => {
  if (!supervisors || supervisors.length === 0) {
    return (
      <div>
        <h3 className="font-medium mb-2">Dosen Pembimbing</h3>
        <p className="text-gray-700">-</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-medium mb-2">Dosen Pembimbing</h3>
      <div className="space-y-2">
        {supervisors.map((supervisor, index) => (
          <div 
            key={supervisor.id}
            className="flex items-center p-2 bg-gray-50 rounded"
          >
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={supervisor.profile_image || "/placeholder.svg"} alt={supervisor.full_name} />
              <AvatarFallback>{supervisor.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="font-medium">{supervisor.full_name}</div>
            <div className="ml-auto text-xs text-gray-500">Pembimbing {index + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupervisorsList;
