
import { 
  User, Student, Supervisor, Proposal, KpTeam, 
  GuideDocument, ActivityLog, Attachment 
} from '@/types';

// Mock Users
export const users: User[] = [
  {
    id: '1',
    username: 'admin',
    name: 'Super Admin',
    role: 'admin',
    email: 'admin@university.ac.id',
  },
  {
    id: '2',
    username: 'coordinator',
    name: 'Dr. Budi Koordinator',
    role: 'coordinator',
    email: 'coordinator@university.ac.id',
  }
];

// Mock Students
export const students: Student[] = [
  {
    id: '3',
    username: 'student1',
    name: 'Andi Mahasiswa',
    role: 'student',
    email: 'andi@student.ac.id',
    nim: '12345678',
    faculty: 'Teknik',
    department: 'Informatika',
    kpTeamId: 'team1',
  },
  {
    id: '4',
    username: 'student2',
    name: 'Budi Santoso',
    role: 'student',
    email: 'budi@student.ac.id',
    nim: '12345679',
    faculty: 'Teknik',
    department: 'Informatika',
    kpTeamId: 'team1',
  },
  {
    id: '5',
    username: 'student3',
    name: 'Cindy Puspita',
    role: 'student',
    email: 'cindy@student.ac.id',
    nim: '12345680',
    faculty: 'Teknik',
    department: 'Informatika',
  }
];

// Mock Supervisors
export const supervisors: Supervisor[] = [
  {
    id: '6',
    username: 'supervisor1',
    name: 'Dr. Agus Dosen',
    role: 'supervisor',
    email: 'agus@university.ac.id',
    nip: '19801212',
    department: 'Informatika',
    hasDigitalSignature: true,
  },
  {
    id: '7',
    username: 'supervisor2',
    name: 'Dr. Diana Dosen',
    role: 'supervisor',
    email: 'diana@university.ac.id',
    nip: '19850505',
    department: 'Informatika',
    hasDigitalSignature: false,
  }
];

// Mock KP Teams
export const teams: KpTeam[] = [
  {
    id: 'team1',
    name: 'Tim Sistem Informasi KP',
    members: [students[0], students[1]],
    supervisors: [supervisors[0]],
    proposalId: 'proposal1',
  }
];

// Mock Attachments
export const attachments: Attachment[] = [
  {
    id: 'attachment1',
    name: 'Proposal KP - Sistem Informasi.pdf',
    fileUrl: '/files/proposal.pdf',
    uploadDate: '2023-04-10T09:00:00Z',
    type: 'proposal',
  },
  {
    id: 'attachment2',
    name: 'Panduan KP 2023.pdf',
    fileUrl: '/files/panduan.pdf',
    uploadDate: '2023-01-15T10:30:00Z',
    type: 'guide',
  }
];

// Mock Proposals
export const proposals: Proposal[] = [
  {
    id: 'proposal1',
    title: 'Sistem Informasi Manajemen KP',
    description: 'Pengembangan sistem informasi untuk manajemen kerja praktik mahasiswa',
    teamId: 'team1',
    supervisorIds: ['6'],
    status: 'submitted',
    submissionDate: '2023-04-10T09:00:00Z',
    attachments: [attachments[0]],
  },
  {
    id: 'proposal2',
    title: 'Aplikasi Mobile Monitoring KP',
    description: 'Pengembangan aplikasi mobile untuk monitoring kegiatan kerja praktik',
    teamId: 'team2',
    supervisorIds: ['7'],
    status: 'approved',
    submissionDate: '2023-03-20T14:30:00Z',
    reviewDate: '2023-03-25T10:15:00Z',
    attachments: [],
  },
  {
    id: 'proposal3',
    title: 'Website Profil Perusahaan',
    description: 'Pembuatan website profil perusahaan dengan CMS',
    teamId: 'team3',
    supervisorIds: ['6', '7'],
    status: 'rejected',
    submissionDate: '2023-04-05T11:20:00Z',
    reviewDate: '2023-04-08T13:45:00Z',
    rejectionReason: 'Topik tidak sesuai dengan bidang keahlian',
    attachments: [],
  }
];

// Mock Guide Documents
export const guideDocuments: GuideDocument[] = [
  {
    id: 'guide1',
    title: 'Panduan Kerja Praktik 2023',
    fileUrl: '/files/panduan_kp_2023.pdf',
    uploadDate: '2023-01-15T10:30:00Z',
    description: 'Dokumen panduan resmi kerja praktik tahun 2023',
  },
  {
    id: 'guide2',
    title: 'Template Laporan KP',
    fileUrl: '/files/template_laporan.docx',
    uploadDate: '2023-01-20T09:45:00Z',
    description: 'Template untuk menyusun laporan kerja praktik',
  }
];

// Mock Activity Logs
export const activityLogs: ActivityLog[] = [
  {
    id: 'log1',
    userId: '3',
    userName: 'Andi Mahasiswa',
    action: 'Mengajukan proposal KP',
    targetType: 'proposal',
    targetId: 'proposal1',
    timestamp: '2023-04-10T09:00:00Z',
  },
  {
    id: 'log2',
    userId: '2',
    userName: 'Dr. Budi Koordinator',
    action: 'Menyetujui proposal KP',
    targetType: 'proposal',
    targetId: 'proposal2',
    timestamp: '2023-03-25T10:15:00Z',
  },
  {
    id: 'log3',
    userId: '2',
    userName: 'Dr. Budi Koordinator',
    action: 'Menolak proposal KP',
    targetType: 'proposal',
    targetId: 'proposal3',
    timestamp: '2023-04-08T13:45:00Z',
  },
  {
    id: 'log4',
    userId: '1',
    userName: 'Super Admin',
    action: 'Menambahkan panduan KP baru',
    targetType: 'guide',
    targetId: 'guide1',
    timestamp: '2023-01-15T10:30:00Z',
  }
];

// Helper function to format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
