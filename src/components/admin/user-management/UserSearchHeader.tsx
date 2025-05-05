
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Search } from 'lucide-react';
import { AddUserForm } from './AddUserForm';

interface UserSearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (isOpen: boolean) => void;
  fetchUsers: () => void;
}

export const UserSearchHeader = ({
  searchQuery,
  setSearchQuery,
  isAddDialogOpen,
  setIsAddDialogOpen,
  fetchUsers
}: UserSearchHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
        <p className="text-gray-600">Kelola semua pengguna dalam sistem</p>
      </div>
      
      <div className="flex gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-64">
          <Input
            placeholder="Cari pengguna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <PlusCircle size={16} className="mr-1" /> Tambah
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
    </div>
  );
};
