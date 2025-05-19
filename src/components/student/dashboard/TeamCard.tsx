
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
    <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
      <CardHeader>
        <CardTitle>Tim KP</CardTitle>
        <CardDescription>Informasi tim KP Anda</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {team ? (
          <>
            <div className="flex flex-col space-y-1">
              <span className="font-medium text-gray-700">Nama Tim:</span>
              <span className="text-sm">{team.name}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700 block mb-2">Anggota:</span>
              <div className="space-y-2">
                {team.members && team.members.length > 0 ? team.members.map(member => (
                  <div key={member.id} className="flex items-center p-1.5 bg-gray-50 rounded text-sm">
                    <Avatar className="h-6 w-6 mr-1.5">
                      <AvatarImage src={member.profile_image || "/placeholder.svg"} alt={member.full_name} />
                      <AvatarFallback>{member.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{member.full_name}</span>
                  </div>
                )) : (
                  <div className="p-2 text-gray-500 text-xs">Belum ada anggota tim</div>
                )}
              </div>
            </div>
            
            <div>
              <span className="font-medium text-gray-700 block mb-2">Dosen Pembimbing:</span>
              <div className="space-y-2">
                {team.supervisors && team.supervisors.length > 0 ? team.supervisors.map((supervisor, index) => (
                  <div key={supervisor.id} className="flex items-center p-1.5 bg-gray-50 rounded text-sm">
                    <Avatar className="h-6 w-6 mr-1.5">
                      <AvatarImage src={supervisor.profile_image || "/placeholder.svg"} alt={supervisor.name} />
                      <AvatarFallback>{supervisor.name ? supervisor.name.charAt(0) : 'P'}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{supervisor.name}</span>
                    <span className="ml-auto text-xs text-gray-500">Pembimbing {index + 1}</span>
                  </div>
                )) : (
                  <div className="p-2 text-gray-500 text-xs">Belum ada dosen pembimbing</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <Users className="mx-auto mb-3 text-gray-400" size={32} />
            <p className="text-gray-600 text-sm">Anda belum memiliki tim KP</p>
            <Button 
              className="mt-3 bg-primary hover:bg-primary/90 text-sm py-1 h-8"
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
