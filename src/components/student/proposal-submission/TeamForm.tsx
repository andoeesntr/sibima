
import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, UserPlus, X, AlertTriangle, Lock } from 'lucide-react';

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
  const MAX_TEAM_SIZE = 4;
  
  // Check if current team already exceeds limit (for existing data)
  const isTeamOversized = teamMembers.length > MAX_TEAM_SIZE;
  
  // Calculate how many more members can be added (submitter counts as 1)
  const remainingSlots = MAX_TEAM_SIZE - teamMembers.length;
  
  const availableStudents = students.filter(
    student => !teamMembers.some(member => member.id === student.id)
  );
  
  const handleAddMember = () => {
    if (!selectedMember) {
      toast.error('Pilih mahasiswa terlebih dahulu');
      return;
    }
    
    // Pre-check: Ensure we won't exceed the limit
    if (teamMembers.length >= MAX_TEAM_SIZE) {
      const submitterName = teamMembers[0]?.full_name || 'Anda';
      toast.error(`Tim sudah mencapai batas maksimal ${MAX_TEAM_SIZE} anggota total (termasuk ${submitterName} sebagai pengaju)`);
      return;
    }
    
    const studentToAdd = students.find(s => s.id === selectedMember);
    if (studentToAdd && !teamMembers.some(member => member.id === selectedMember)) {
      const newTeamMembers = [...teamMembers, studentToAdd];
      
      // Double-check before actually adding
      if (newTeamMembers.length > MAX_TEAM_SIZE) {
        toast.error(`Tidak dapat menambahkan anggota. Tim sudah mencapai batas maksimal ${MAX_TEAM_SIZE} orang total`);
        return;
      }
      
      setTeamMembers(newTeamMembers);
      setSelectedMember('');
      toast.success(`${studentToAdd.full_name} berhasil ditambahkan ke tim (${newTeamMembers.length}/${MAX_TEAM_SIZE})`);
    }
  };

  const handleRemoveMember = (id: string) => {
    // Prevent removing the first member (team leader/submitter)
    if (id === teamMembers[0]?.id) {
      toast.error('Anda tidak dapat menghapus diri sendiri dari tim');
      return;
    }
    
    const memberToRemove = teamMembers.find(member => member.id === id);
    const newTeamMembers = teamMembers.filter(member => member.id !== id);
    setTeamMembers(newTeamMembers);
    
    if (memberToRemove) {
      toast.success(`${memberToRemove.full_name} berhasil dihapus dari tim (${newTeamMembers.length}/${MAX_TEAM_SIZE})`);
    }
  };

  const handleAddSupervisor = (id: string) => {
    if (selectedSupervisors.length >= 2) {
      toast.error('Maksimal 2 dosen pembimbing');
      return;
    }
    
    if (!selectedSupervisors.includes(id)) {
      setSelectedSupervisors([...selectedSupervisors, id]);
      const supervisor = supervisors.find(s => s.id === id);
      if (supervisor) {
        toast.success(`${supervisor.full_name} berhasil ditambahkan sebagai dosen pembimbing`);
      }
    }
  };

  const handleRemoveSupervisor = (id: string) => {
    const supervisor = supervisors.find(s => s.id === id);
    setSelectedSupervisors(selectedSupervisors.filter(supervisorId => supervisorId !== id));
    if (supervisor) {
      toast.success(`${supervisor.full_name} berhasil dihapus dari dosen pembimbing`);
    }
  };

  const handleNext = () => {
    // Strict validation before proceeding
    if (teamMembers.length === 0) {
      toast.error('Tim harus memiliki minimal 1 anggota');
      return;
    }
    
    if (teamMembers.length > MAX_TEAM_SIZE) {
      toast.error(`Tim melebihi batas maksimal ${MAX_TEAM_SIZE} anggota total. Silakan hapus ${teamMembers.length - MAX_TEAM_SIZE} anggota sebelum melanjutkan.`);
      return;
    }
    
    if (selectedSupervisors.length === 0) {
      toast.error('Pilih minimal 1 dosen pembimbing');
      return;
    }
    
    if (selectedSupervisors.length > 2) {
      toast.error('Maksimal 2 dosen pembimbing');
      return;
    }
    
    console.log(`Team validation passed. Members: ${teamMembers.length}/${MAX_TEAM_SIZE}, Supervisors: ${selectedSupervisors.length}/2`);
    onNext();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditMode ? 'Tim KP (Revisi)' : 'Tim KP'}
          {isEditMode && existingTeamId && <Lock size={16} className="text-gray-500" />}
        </CardTitle>
        <CardDescription>
          {isEditMode && existingTeamId 
            ? 'Tim anggota KP sudah terbentuk dan tidak dapat diubah saat revisi' 
            : `Tambahkan anggota tim (maksimal ${MAX_TEAM_SIZE} orang total termasuk Anda sebagai pengaju) dan pilih dosen pembimbing`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning for oversized teams */}
        {isTeamOversized && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-red-800 font-medium">Tim Melebihi Batas Maksimal</h4>
              <p className="text-red-700 text-sm mt-1">
                Tim Anda memiliki {teamMembers.length} anggota, melebihi batas maksimal {MAX_TEAM_SIZE} orang total. 
                Silakan hapus {teamMembers.length - MAX_TEAM_SIZE} anggota untuk melanjutkan.
              </p>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <Label>Anggota Tim <span className="text-red-500">*</span></Label>
          
          {/* Team size indicator with warning colors */}
          <div className={`text-sm p-2 rounded ${
            isTeamOversized 
              ? 'text-red-700 bg-red-50 border border-red-200' 
              : teamMembers.length === MAX_TEAM_SIZE 
                ? 'text-amber-700 bg-amber-50 border border-amber-200'
                : 'text-blue-700 bg-blue-50 border border-blue-200'
          }`}>
            Anggota saat ini: {teamMembers.length}/{MAX_TEAM_SIZE} (termasuk pengaju)
            {remainingSlots > 0 && !isEditMode && (
              <span className="ml-2">• Sisa slot: {remainingSlots}</span>
            )}
            {isTeamOversized && (
              <span className="ml-2 font-medium">⚠️ MELEBIHI BATAS</span>
            )}
          </div>
          
          <div className="space-y-2">
            {teamMembers.map((member, index) => (
              <div 
                key={member.id}
                className={`flex items-center justify-between p-3 border rounded-md ${
                  index >= MAX_TEAM_SIZE ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User size={18} />
                  <span>
                    {member.full_name || 'Unnamed'} {member.nim ? `(${member.nim})` : ''} 
                    {index === 0 && <Badge className="ml-2">Pengaju</Badge>}
                    {index >= MAX_TEAM_SIZE && <Badge variant="destructive" className="ml-2">Melebihi Batas</Badge>}
                  </span>
                </div>
                
                {index !== 0 && !isEditMode && !existingTeamId && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveMember(member.id)}
                    className={index >= MAX_TEAM_SIZE ? 'text-red-600 hover:text-red-700' : ''}
                  >
                    <X size={16} />
                  </Button>
                )}
                
                {isEditMode && existingTeamId && index !== 0 && (
                  <Lock size={16} className="text-gray-400" />
                )}
              </div>
            ))}
          </div>
          
          {!isEditMode && !existingTeamId && (
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
          )}
          
          {teamMembers.length >= MAX_TEAM_SIZE && !isEditMode && (
            <p className={`text-xs p-2 rounded ${
              isTeamOversized 
                ? 'text-red-600 bg-red-50' 
                : 'text-amber-600 bg-amber-50'
            }`}>
              {isTeamOversized 
                ? `❌ Tim melebihi batas maksimal ${MAX_TEAM_SIZE} orang total` 
                : `✅ Jumlah maksimal anggota tim (${MAX_TEAM_SIZE}) telah tercapai`}
            </p>
          )}
          
          {isEditMode && existingTeamId && (
            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded flex items-center gap-2">
              <Lock size={14} />
              Anggota tim tidak dapat diubah saat melakukan revisi proposal
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
          onClick={handleNext}
          className="bg-primary hover:bg-primary/90"
          disabled={isTeamOversized}
        >
          Selanjutnya
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TeamForm;
