
import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, UserPlus, X } from 'lucide-react';

interface Student {
  id: string;
  full_name: string;
  nim?: string;
}

interface Supervisor {
  id: string;
  full_name: string;
}

interface TeamFormProps {
  teamMembers: Student[];
  setTeamMembers: (members: Student[]) => void;
  selectedSupervisors: string[];
  setSelectedSupervisors: (supervisors: string[]) => void;
  students: Student[];
  supervisors: Supervisor[];
  isEditMode: boolean;
  existingTeamId: string | null;
  onNext: () => void;
  onBack: () => void;
}

const TeamForm = ({
  teamMembers,
  setTeamMembers,
  selectedSupervisors,
  setSelectedSupervisors,
  students,
  supervisors,
  isEditMode,
  existingTeamId,
  onNext,
  onBack
}: TeamFormProps) => {
  const [selectedMember, setSelectedMember] = useState('');
  const MAX_TEAM_SIZE = 4; // Maximum team size (including the person submitting)
  
  const availableStudents = students.filter(
    student => !teamMembers.some(member => member.id === student.id)
  );
  
  const handleAddMember = () => {
    if (!selectedMember) return;
    
    // Check if adding this member would exceed the maximum team size
    if (teamMembers.length >= MAX_TEAM_SIZE) {
      toast.error(`Maksimal anggota tim adalah ${MAX_TEAM_SIZE} orang`);
      return;
    }
    
    const studentToAdd = students.find(s => s.id === selectedMember);
    if (studentToAdd && !teamMembers.some(member => member.id === selectedMember)) {
      setTeamMembers([...teamMembers, studentToAdd]);
      setSelectedMember('');
    }
  };

  const handleRemoveMember = (id: string) => {
    if (id === teamMembers[0]?.id) {
      toast.error('Anda tidak dapat menghapus diri sendiri dari tim');
      return;
    }
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };

  const handleAddSupervisor = (id: string) => {
    if (selectedSupervisors.length >= 2) {
      toast.error('Maksimal 2 dosen pembimbing');
      return;
    }
    
    if (!selectedSupervisors.includes(id)) {
      setSelectedSupervisors([...selectedSupervisors, id]);
    }
  };

  const handleRemoveSupervisor = (id: string) => {
    setSelectedSupervisors(selectedSupervisors.filter(supervisorId => supervisorId !== id));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Tim KP (Revisi)' : 'Tim KP'}</CardTitle>
        <CardDescription>
          {isEditMode && existingTeamId 
            ? 'Tim anggota KP sudah terbentuk dan tidak dapat diubah saat revisi' 
            : `Tambahkan anggota tim (maksimal ${MAX_TEAM_SIZE} orang) dan pilih dosen pembimbing`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Anggota Tim <span className="text-red-500">*</span></Label>
          
          <div className="space-y-2">
            {teamMembers.map((member, index) => (
              <div 
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center gap-2">
                  <User size={18} />
                  <span>
                    {member.full_name || 'Unnamed'} {member.nim ? `(${member.nim})` : ''} {index === 0 && <Badge className="ml-1">Ketua</Badge>}
                  </span>
                </div>
                
                {index !== 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Pilih mahasiswa" />
              </SelectTrigger>
              <SelectContent>
                {availableStudents.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name} {student.nim ? `(${student.nim})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              className="flex-shrink-0"
              onClick={handleAddMember}
              disabled={!selectedMember || teamMembers.length >= MAX_TEAM_SIZE}
            >
              <UserPlus size={16} className="mr-1" /> Tambah
            </Button>
          </div>
          
          {teamMembers.length >= MAX_TEAM_SIZE && (
            <p className="text-xs text-amber-600">
              Jumlah maksimal anggota tim ({MAX_TEAM_SIZE}) telah tercapai
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          <Label>Dosen Pembimbing (Maksimal 2) <span className="text-red-500">*</span></Label>
          
          <div className="space-y-2">
            {selectedSupervisors.length > 0 ? (
              selectedSupervisors.map((supervisorId) => {
                const supervisor = supervisors.find(s => s.id === supervisorId);
                return supervisor ? (
                  <div 
                    key={supervisor.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <User size={18} />
                      <span>{supervisor.full_name}</span>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveSupervisor(supervisor.id)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ) : null;
              })
            ) : (
              <div className="p-3 border border-dashed rounded-md flex items-center justify-center">
                <span className="text-gray-500">Belum ada dosen pembimbing yang dipilih</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {supervisors.map(supervisor => (
              <Button
                key={supervisor.id}
                variant="outline"
                className={selectedSupervisors.includes(supervisor.id) ? 
                  'bg-primary/10 border-primary' : ''}
                onClick={() => {
                  if (selectedSupervisors.includes(supervisor.id)) {
                    handleRemoveSupervisor(supervisor.id);
                  } else {
                    handleAddSupervisor(supervisor.id);
                  }
                }}
                disabled={selectedSupervisors.length >= 2 && !selectedSupervisors.includes(supervisor.id)}
              >
                <User size={16} className="mr-2" />
                {supervisor.full_name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Kembali
        </Button>
        <Button 
          onClick={onNext}
          className="bg-primary hover:bg-primary/90"
        >
          Selanjutnya
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TeamForm;
