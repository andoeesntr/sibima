
import { Calendar, FileText, Users, Settings, PenTool } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: Settings
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users
  },
  {
    title: 'Guide Management', 
    href: '/admin/guides',
    icon: FileText
  },
  {
    title: 'Digital Signatures',
    href: '/admin/digital-signatures',
    icon: PenTool
  },
  {
    title: 'Timeline KP',
    href: '/admin/timeline',
    icon: Calendar
  }
];

const AdminNavigation = () => {
  const location = useLocation();

  return (
    <nav className="space-y-1">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
};

export default AdminNavigation;
