
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Supervisor {
  id: string;
  full_name: string;
  profile_image?: string;
}

interface SupervisorListProps {
  supervisors: Supervisor[];
}

const SupervisorList = ({ supervisors }: SupervisorListProps) => {
  if (!supervisors || supervisors.length === 0) {
    return <p className="text-gray-500">Belum ada pembimbing</p>;
  }

  return (
    <div className="space-y-2">
      {supervisors.map((supervisor, index) => (
        <div key={supervisor.id} className="flex items-center p-2 bg-gray-50 rounded">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={supervisor.profile_image || "/placeholder.svg"} alt={supervisor.full_name} />
            <AvatarFallback>{supervisor.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{supervisor.full_name}</span>
          <span className="ml-auto text-xs text-gray-500">Pembimbing {index + 1}</span>
        </div>
      ))}
    </div>
  );
};

export default SupervisorList;
