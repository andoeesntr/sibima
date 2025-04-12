
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  User, LogOut, FileText, Home, Users, Settings, 
  FileSignature, BookOpen, Layout, Award, FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const roleNavItems: Record<string, NavItem[]> = {
  student: [
    { title: 'Dashboard', href: '/student', icon: <Home size={18} /> },
    { title: 'Pengajuan Proposal', href: '/student/proposal-submission', icon: <FileText size={18} /> },
    { title: 'Digital Signature', href: '/student/digital-signature', icon: <FileSignature size={18} /> },
    { title: 'Panduan KP', href: '/student/guide', icon: <BookOpen size={18} /> },
  ],
  coordinator: [
    { title: 'Dashboard', href: '/coordinator', icon: <Home size={18} /> },
    { title: 'Review Proposal', href: '/coordinator/proposal-review', icon: <FileCheck size={18} /> },
  ],
  admin: [
    { title: 'Dashboard', href: '/admin', icon: <Home size={18} /> },
    { title: 'User Management', href: '/admin/user-management', icon: <Users size={18} /> },
    { title: 'Panduan Management', href: '/admin/guide-management', icon: <BookOpen size={18} /> },
  ],
  supervisor: [
    { title: 'Dashboard', href: '/supervisor', icon: <Home size={18} /> },
    { title: 'Tanda Tangan Digital', href: '/supervisor/digital-signature', icon: <FileSignature size={18} /> },
    { title: 'Feedback', href: '/supervisor/feedback', icon: <FileText size={18} /> },
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
  
  const handleLogout = () => {
    // In a real app, you would clear auth tokens here
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-primary text-white transition-all duration-300 ease-in-out flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex items-center px-4 py-5">
          {isSidebarOpen ? (
            <div className="text-xl font-bold">KP Portal</div>
          ) : (
            <div className="text-xl font-bold mx-auto">KP</div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="ml-auto text-white hover:bg-primary/90"
          >
            <Layout size={18} />
          </Button>
        </div>

        {/* Role Badge */}
        <div className={cn(
          "mx-4 my-2 py-1 px-3 rounded-md bg-primary-foreground/20 text-white text-sm",
          !isSidebarOpen && "mx-auto px-0 bg-transparent"
        )}>
          {isSidebarOpen ? roleLabels[role] : <Award size={18} />}
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
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/80 hover:bg-white/5 hover:text-white",
                    !isSidebarOpen && "px-2 justify-center"
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  {isSidebarOpen && <span>{item.title}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-primary-foreground/10">
          <NavLink
            to={`/${role}/profile`}
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2 rounded-md transition-colors",
              isActive
                ? "bg-white/10 text-white font-medium"
                : "text-white/80 hover:bg-white/5 hover:text-white",
              !isSidebarOpen && "px-2 justify-center"
            )}
          >
            <User size={18} className="mr-2" />
            {isSidebarOpen && <span>Profile</span>}
          </NavLink>
          
          <Button 
            variant="ghost" 
            className="w-full mt-2 text-white/80 hover:bg-white/5 hover:text-white flex items-center px-4 py-2"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2" />
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
              {roleNavItems[role].find(item => window.location.pathname.includes(item.href))?.title || 'Dashboard'}
            </h1>
            
            <div className="flex items-center space-x-4">
              <Avatar className="cursor-pointer" onClick={() => navigate(`/${role}/profile`)}>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>{role[0].toUpperCase()}</AvatarFallback>
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
