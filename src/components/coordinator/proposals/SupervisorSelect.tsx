
import { Supervisor } from '@/services/supervisorService';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface SupervisorSelectProps {
  index: number;
  value: string;
  supervisors: Supervisor[];
  onSelect: (index: number, value: string) => void;
  disabled?: boolean;
}

const SupervisorSelect = ({
  index,
  value,
  supervisors,
  onSelect,
  disabled = false
}: SupervisorSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={`supervisor-select-${index + 1}`}>Dosen Pembimbing {index + 1}</Label>
      <Select 
        value={value || ''} 
        onValueChange={(val) => onSelect(index, val)}
        disabled={disabled}
      >
        <SelectTrigger id={`supervisor-select-${index + 1}`}>
          <SelectValue placeholder="Pilih dosen pembimbing" />
        </SelectTrigger>
        <SelectContent>
          {supervisors.map((supervisor) => (
            <SelectItem key={supervisor.id} value={supervisor.id}>
              {supervisor.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SupervisorSelect;
