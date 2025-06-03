
import { cn } from "@/lib/utils";

interface AvatarProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Avatar = ({ children, className, ...props }: AvatarProps) => {
  return (
    <div 
      className={cn("relative w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export const AvatarFallback = ({ children }: { children: React.ReactNode }) => {
  return <div className="font-medium text-lg">{children}</div>;
};
