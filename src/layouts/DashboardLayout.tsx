
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  User, LogOut, FileText, Home, Users, Settings, 
  FileSignature, BookOpen, Layout, Award, FileCheck, GraduationCap,
  ClipboardList, TrendingUp, Clock, BarChart3
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const roleNavItems: Record<string, NavItem[]> = {
  student: [
    { title: 'Dashboard', href: '/student', icon: <Home size={18} className="text-yellow-500" /> },
    { title: 'Pendaftaran KP', href: '/student/kp-registration', icon: <ClipboardList size={18} className="text-yellow-500" /> },
    { title: 'Pengajuan Proposal', href: '/student/proposal-submission', icon: <FileText size={18} className="text-yellow-500" /> },
    { title: 'Progress KP', href: '/student/kp-progress', icon: <TrendingUp size={18} className="text-yellow-500" /> },
    { title: 'Timesheet KP', href: '/student/timesheet', icon: <Clock size={18} className="text-yellow-500" /> },
    { title: 'Digital Signature', href: '/student/digital-signature', icon: <FileSignature size={18} className="text-yellow-500" /> },
    { title: 'Panduan KP', href: '/student/guide', icon: <BookOpen size={18} className="text-yellow-500" /> },
  ],
  coordinator: [
    { title: 'Dashboard', href: '/coordinator', icon: <Home size={18} className="text-yellow-500" /> },
    { title: 'Daftar Proposal', href: '/coordinator/proposal-list', icon: <ClipboardList size={18} className="text-yellow-500" /> },
    { title: 'Review Proposal', href: '/coordinator/proposal-review', icon: <FileCheck size={18} className="text-yellow-500" /> },
    { title: 'Progress Mahasiswa', href: '/coordinator/student-progress', icon: <BarChart3 size={18} className="text-yellow-500" /> },
    { title: 'Penilaian', href: '/coordinator/student-evaluation', icon: <GraduationCap size={18} className="text-yellow-500" /> },
    { title: 'Rekap Timesheet', href: '/coordinator/timesheet-overview', icon: <Clock size={18} className="text-yellow-500" /> },
    { title: 'Manajemen Pendaftaran KP', href: '/coordinator/kp-registration-management', icon: <ClipboardList size={18} className="text-yellow-500" /> },
    { title: 'Manajemen Bimbingan', href: '/coordinator/guidance-management', icon: <TrendingUp size={18} className="text-yellow-500" /> },
  ],
  admin: [
    { title: 'Dashboard', href: '/admin', icon: <Home size={18} className="text-yellow-500" /> },
    { title: 'User Management', href: '/admin/user-management', icon: <Users size={18} className="text-yellow-500" /> },
    { title: 'Panduan Management', href: '/admin/guide-management', icon: <BookOpen size={18} className="text-yellow-500" /> },
    { title: 'Timeline KP Management', href: '/admin/kp-timeline-management', icon: <Layout size={18} className="text-yellow-500" /> },
  ],
  supervisor: [
    { title: 'Dashboard', href: '/supervisor', icon: <Home size={18} className="text-yellow-500" /> },
    { title: 'Progress Mahasiswa', href: '/supervisor/student-progress', icon: <BarChart3 size={18} className="text-yellow-500" /> },
    { title: 'Progress KP', href: '/supervisor/kp-progress', icon: <TrendingUp size={18} className="text-yellow-500" /> },
    { title: 'Rekap Timesheet', href: '/supervisor/timesheet-overview', icon: <Clock size={18} className="text-yellow-500" /> },
    { title: 'Tanda Tangan Digital', href: '/supervisor/digital-signature', icon: <FileSignature size={18} className="text-yellow-500" /> },
    { title: 'Feedback', href: '/supervisor/feedback', icon: <FileText size={18} className="text-yellow-500" /> },
  ],
};

const roleLabels: Record<string, string> = {
  student: 'Mahasiswa',
  coordinator: 'Koordinator KP',
  admin: 'Super Admin',
  supervisor: 'Dosen Pembimbing',
};

type DashboardLayoutProps = {
  role: 'student' | 'coordinator' | 'admin' | 'supervisor';
}

const DashboardLayout = ({ role }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  
  const handleLogout = () => {
    signOut();
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return role[0].toUpperCase();
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out flex flex-col",
          "bg-green-800 text-white",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex items-center px-4 py-5">
          {isSidebarOpen ? (
            <div className="text-xl font-bold text-white">SIBIMA</div>
          ) : (
            <div className="text-xl font-bold text-white">S</div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="ml-auto text-white hover:bg-green-700"
          >
            <Layout size={18} className="text-yellow-500" />
          </Button>
        </div>

        {/* Role Badge */}
        <div className={cn(
          "mx-4 my-2 py-1 px-3 rounded-md bg-green-700 text-white text-sm",
          !isSidebarOpen && "mx-auto px-0 bg-transparent"
        )}>
          {isSidebarOpen ? roleLabels[role] : <Award size={18} className="text-yellow-500" />}
        </div>

        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {roleNavItems[role].map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) => cn(
                    "flex items-center px-4 py-3 rounded-md transition-colors",
                    isActive
                      ? "bg-green-700 text-white font-medium"
                      : "text-gray-200 hover:bg-green-700 hover:text-white",
                    !isSidebarOpen && "px-2 justify-center"
                  )}
                  end={item.href === `/${role}`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {isSidebarOpen && <span>{item.title}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-green-700">
          <NavLink
            to={`/${role}/profile`}
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2 rounded-md transition-colors",
              isActive
                ? "bg-green-700 text-white font-medium"
                : "text-gray-200 hover:bg-green-700 hover:text-white",
              !isSidebarOpen && "px-2 justify-center"
            )}
          >
            <User size={18} className="mr-2 text-yellow-500" />
            {isSidebarOpen && <span>Profile</span>}
          </NavLink>
          
          <Button 
            variant="ghost" 
            className="w-full mt-2 text-gray-200 hover:bg-green-700 hover:text-white flex items-center px-4 py-2"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2 text-yellow-500" />
            {isSidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "ml-64" : "ml-20"
      )}>
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-800">
              {roleNavItems[role].find(item => window.location.pathname === item.href)?.title || 'Dashboard'}
            </h1>
            
            <div className="flex items-center space-x-4">
              <Avatar className="cursor-pointer" onClick={() => navigate(`/${role}/profile`)}>
                <AvatarImage src={profile?.profile_image || '/placeholder.svg'} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

