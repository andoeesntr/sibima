
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

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

interface TeamInfoProps {
  team?: Team | null;
  student: {
    id: string;
    full_name: string;
  };
  supervisor?: {
    id: string;
    full_name: string;
    profile_image?: string;
  } | null;
}

const TeamInfo = ({ team, student, supervisor }: TeamInfoProps) => {
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
        
        {supervisor && (
          <div>
            <h3 className="font-medium mb-2">Dosen Pembimbing</h3>
            <div className="flex items-center p-2 bg-gray-50 rounded">
              <User size={16} className="mr-2" />
              <div className="font-medium">{supervisor.full_name}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamInfo;
