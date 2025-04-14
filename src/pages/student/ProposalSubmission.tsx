
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileUp, Plus, Trash, User, UserPlus, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  full_name: string;
  nim?: string;
}

interface Supervisor {
  id: string;
  full_name: string;
}

const ProposalSubmission = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamName, setTeamName] = useState('');
  const [selectedSupervisors, setSelectedSupervisors] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<Student[]>([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState('');
  
  const [formStepValid, setFormStepValid] = useState(false);
  const [teamStepValid, setTeamStepValid] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('id, full_name, nim')
          .eq('role', 'student');

        if (studentsError) {
          throw studentsError;
        }

        const { data: supervisorsData, error: supervisorsError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'supervisor');

        if (supervisorsError) {
          throw supervisorsError;
        }

        setStudents(studentsData || []);
        setSupervisors(supervisorsData || []);

        if (profile && profile.role === 'student') {
          setTeamMembers([{
            id: user.id,
            full_name: profile.full_name || 'Unnamed Student',
            nim: profile.nim
          }]);
        }

      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error(`Failed to load data: ${error.message}`);
      }
    };

    fetchData();
  }, [user, profile]);

  const availableStudents = students.filter(
    student => !teamMembers.some(member => member.id === student.id)
  );

  const handleAddMember = () => {
    if (!selectedMember) return;
    
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleTabChange = (value: string) => {
    // From Form to another tab
    if (activeTab === 'form' && (value === 'team' || value === 'upload')) {
      if (!formStepValid) {
        toast.error('Harap isi semua bidang yang diperlukan pada Formulir Proposal');
        return;
      }
    }
    
    // From Team to Upload
    if (activeTab === 'team' && value === 'upload') {
      if (!teamStepValid) {
        toast.error('Harap pilih minimal satu dosen pembimbing dan pastikan tim memiliki anggota');
        return;
      }
    }
    
    // Always allow backward navigation
    if ((activeTab === 'team' && value === 'form') || 
        (activeTab === 'upload' && (value === 'form' || value === 'team'))) {
      setActiveTab(value);
      return;
    }
    
    // Allow navigation if current step is valid
    if ((activeTab === 'form' && value === 'team' && formStepValid) ||
        (activeTab === 'team' && value === 'upload' && teamStepValid)) {
      setActiveTab(value);
    }
  };

  const handleSubmit = async () => {
    if (!formStepValid || !teamStepValid || !file) {
      toast.error('Harap isi semua bidang yang diperlukan');
      return;
    }

    if (selectedSupervisors.length > 2) {
      toast.error('Maksimal 2 dosen pembimbing');
      return;
    }

    if (!user || !profile) {
      toast.error('Anda harus login untuk mengajukan proposal');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: proposalData, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          student_id: user.id,
          title,
          description,
          company_name: companyName,
          supervisor_id: selectedSupervisors[0],
          status: 'submitted'
        })
        .select();

      if (proposalError) {
        throw proposalError;
      }

      await supabase.from('activity_logs').insert({
        user_id: user.id,
        user_name: profile.full_name || user.email,
        action: 'submitted',
        target_type: 'proposal',
        target_id: proposalData[0].id
      });

      toast.success('Proposal berhasil diajukan');
      navigate('/student');
    } catch (error: any) {
      console.error('Error submitting proposal:', error);
      toast.error(`Gagal mengajukan proposal: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
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

  useEffect(() => {
    setFormStepValid(!!title && !!description && !!teamName && !!companyName);
  }, [title, description, teamName, companyName]);

  useEffect(() => {
    setTeamStepValid(teamMembers.length > 0 && selectedSupervisors.length > 0);
  }, [teamMembers, selectedSupervisors]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pengajuan Proposal KP</h1>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form">Formulir Proposal</TabsTrigger>
          <TabsTrigger value="team">Tim KP</TabsTrigger>
          <TabsTrigger value="upload">Upload Dokumen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="form">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Informasi Proposal</CardTitle>
              <CardDescription>
                Masukkan informasi proposal kerja praktik yang akan diajukan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Proposal <span className="text-red-500">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="Masukkan judul proposal" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="description" 
                  placeholder="Jelaskan singkat tentang proposal KP Anda"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyName">Nama Perusahaan/Instansi <span className="text-red-500">*</span></Label>
                <Input 
                  id="companyName" 
                  placeholder="Masukkan nama perusahaan/instansi" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="teamName">Nama Tim <span className="text-red-500">*</span></Label>
                <Input 
                  id="teamName" 
                  placeholder="Masukkan nama tim KP" 
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/student')}>
                Batal
              </Button>
              <Button 
                onClick={() => handleTabChange('team')}
                className="bg-primary hover:bg-primary/90"
              >
                Selanjutnya
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Tim KP</CardTitle>
              <CardDescription>
                Tambahkan anggota tim dan pilih dosen pembimbing
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
                    disabled={!selectedMember}
                  >
                    <UserPlus size={16} className="mr-1" /> Tambah
                  </Button>
                </div>
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
              <Button variant="outline" onClick={() => handleTabChange('form')}>
                Kembali
              </Button>
              <Button 
                onClick={() => handleTabChange('upload')}
                className="bg-primary hover:bg-primary/90"
              >
                Selanjutnya
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Dokumen</CardTitle>
              <CardDescription>
                Upload dokumen proposal KP Anda dalam format PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                <FileUp size={40} className="text-gray-400 mb-4" />
                <p className="mb-4 text-sm text-gray-600 text-center">
                  Drag & drop file proposal Anda di sini, atau klik tombol di bawah
                </p>
                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="sr-only">Upload file</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                  {file && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setFile(null)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded border border-yellow-200 flex items-start">
                <AlertCircle className="text-yellow-500 mr-2" size={20} />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-1">Informasi penting</p>
                  <p>
                    Dokumen proposal harus dalam format PDF dengan ukuran maksimal 5MB.
                    Pastikan proposal sudah sesuai dengan template yang tersedia di panduan KP.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleTabChange('team')}>
                Kembali
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90"
                disabled={isSubmitting || !file}
              >
                {isSubmitting ? 'Memproses...' : 'Ajukan Proposal'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProposalSubmission;
