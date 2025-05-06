
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, User, Users } from "lucide-react";

interface TeamMember {
  id: string;
  full_name: string;
  nim?: string;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

export interface Supervisor {
  id: string;
  full_name: string;
  profile_image?: string;
}

interface TeamInfoProps {
  team?: Team | null;
  student: {
    id: string;
    full_name: string;
  };
  supervisors: Supervisor[];
  onEditSupervisor?: () => void;
  isCoordinator?: boolean;
}

const TeamInfo = ({ team, student, supervisors, onEditSupervisor, isCoordinator = false }: TeamInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Tim</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {team && (
          <>
            <div>
              <h3 className="font-medium mb-2">Nama Tim</h3>
              <p className="text-gray-600">{team.name}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Anggota Tim</h3>
              <div className="space-y-2">
                {team.members.map(member => (
                  <div 
                    key={member.id}
                    className="flex items-center p-2 bg-gray-50 rounded"
                  >
                    <User size={16} className="mr-2" />
                    <div>
                      <div className="font-medium">{member.full_name}</div>
                      {member.nim && <div className="text-xs text-gray-500">{member.nim}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        <div>
          <h3 className="font-medium mb-2">Mahasiswa</h3>
          <div className="flex items-center p-2 bg-gray-50 rounded">
            <User size={16} className="mr-2" />
            <div className="font-medium">{student.full_name}</div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Dosen Pembimbing</h3>
            {isCoordinator && onEditSupervisor && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onEditSupervisor}
                className="h-8 w-8 p-0"
              >
                <Pencil size={16} />
                <span className="sr-only">Edit Dosen Pembimbing</span>
              </Button>
            )}
          </div>
          
          {supervisors.length > 0 ? (
            <div className="space-y-2">
              {supervisors.map((supervisor, index) => (
                <div 
                  key={supervisor.id}
                  className="flex items-center p-2 bg-gray-50 rounded"
                >
                  <User size={16} className="mr-2" />
                  <div className="font-medium">{supervisor.full_name}</div>
                  <div className="ml-auto text-xs text-gray-500">Pembimbing {index + 1}</div>
                </div>
              ))}
            </div>
          ) : (
            isCoordinator && onEditSupervisor ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onEditSupervisor}
                className="flex items-center"
              >
                <Pencil size={16} className="mr-2" />
                Tambah Dosen Pembimbing
              </Button>
            ) : (
              <p className="text-gray-500">Belum ada dosen pembimbing</p>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamInfo;
