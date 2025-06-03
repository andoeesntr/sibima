
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import SupervisorEditDialog from './SupervisorEditDialog';
import { Supervisor } from "@/services/supervisorService";

interface SupervisorSelectionButtonProps {
  proposalId: string;
  teamId?: string | null;
  currentSupervisors: Supervisor[];
  onSupervisorsUpdated: (supervisors: Supervisor[]) => void;
}

const SupervisorSelectionButton = ({
  proposalId,
  teamId,
  currentSupervisors,
  onSupervisorsUpdated
}: SupervisorSelectionButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        className="w-full"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        {currentSupervisors.length > 0 ? 'Ubah Dosen Pembimbing' : 'Tambah Dosen Pembimbing'}
      </Button>

      <SupervisorEditDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        proposalId={proposalId}
        teamId={teamId}
        currentSupervisors={currentSupervisors}
        onSupervisorsUpdated={onSupervisorsUpdated}
      />
    </>
  );
};

export default SupervisorSelectionButton;
