
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserRole } from "@/types";
import { Key, MoreHorizontal, Pencil, Trash, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "./UserAvatar";
import { UserData } from "./types";

interface UserTableProps {
  users: UserData[];
  isLoading: boolean;
  roleLabels: Record<UserRole, string>;
  handleEditUser: (userData: UserData) => void;
  handleResetPassword: (userId: string) => void;
  handleDeleteUser: (userId: string, userName: string) => void;
}

export const UserTable = ({
  users,
  isLoading,
  roleLabels,
  handleEditUser,
  handleResetPassword,
  handleDeleteUser
}: UserTableProps) => {
  return (
    <>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <Avatar>
                            <AvatarFallback>{user.name ? user.name[0] : 'U'}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || 'Unnamed User'}</div>
                          <div className="text-sm text-gray-500">
                            {user.role === 'student' && user.nim}
                            {user.role === 'supervisor' && user.nip}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={
                        user.role === 'admin' ? 'bg-purple-500' :
                        user.role === 'supervisor' ? 'bg-blue-500' :
                        user.role === 'coordinator' ? 'bg-orange-500' :
                        'bg-green-500'
                      }>
                        {roleLabels[user.role]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                            <span className="sr-only">Action</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Pencil size={14} className="mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                            <Key size={14} className="mr-2" /> Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                          >
                            <Trash size={14} className="mr-2" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    <Users className="mx-auto h-10 w-10 opacity-30 mb-2" />
                    <p>Tidak ada pengguna yang ditemukan</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};
