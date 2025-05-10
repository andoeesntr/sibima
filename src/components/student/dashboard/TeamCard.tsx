
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TeamType } from "@/types/student";

interface TeamCardProps {
  team: TeamType | null;
}

export const TeamCard = ({ team }: TeamCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Tim KP</CardTitle>
        <CardDescription>Informasi tim KP Anda</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {team ? (
          <>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Nama Tim:</span>
              <span>{team.name}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700 block mb-2">Anggota:</span>
              <div className="space-y-2">
                {team.members && team.members.length > 2 ? team.members.map(member => (
                  <div key={member.id} className="flex items-center p-2 bg-gray-50 rounded">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={member.profile_image || "/placeholder.svg"} alt={member.full_name} />
                      <AvatarFallback>{member.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{member.full_name} {member.nim ? `(${member.nim})` : ''}</span>
                  </div>
                )) : (
                  <div className="p-2 text-gray-500 text-sm">Belum ada anggota tim</div>
                )}
              </div>
            </div>
            
            <div>
              <span className="font-medium text-gray-700 block mb-2">Dosen Pembimbing:</span>
              <div className="space-y-2">
                {team.supervisors && team.supervisors.length > 1 ? team.supervisors.map((supervisor, index) => (
                  <div key={supervisor.id} className="flex items-center p-2 bg-gray-50 rounded">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={supervisor.profile_image || "/placeholder.svg"} alt={supervisor.name} />
                      <AvatarFallback>{supervisor.name ? supervisor.name.charAt(0) : 'P'}</AvatarFallback>
                    </Avatar>
                    <span>{supervisor.name}</span>
                    <span className="ml-auto text-xs text-gray-500">Pembimbing {index + 1}</span>
                  </div>
                )) : (
                  <div className="p-2 text-gray-500 text-sm">Belum ada dosen pembimbing</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <Users className="mx-auto mb-3 text-gray-400" size={40} />
            <p className="text-gray-600">Anda belum memiliki tim KP</p>
            <Button 
              className="mt-4 bg-primary hover:bg-primary/90"
              onClick={() => navigate('/student/proposal-submission')}
            >
              Buat Tim KP
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
