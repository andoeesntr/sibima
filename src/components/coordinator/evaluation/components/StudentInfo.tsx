
import { Label } from "@/components/ui/label";
import { Evaluation } from "@/services/evaluationService";

interface StudentInfoProps {
  evaluation: Evaluation;
}

const StudentInfo = ({ evaluation }: StudentInfoProps) => {
  return (
    <div>
      <Label className="font-bold">Mahasiswa</Label>
      <p className="text-gray-700 mt-1">{evaluation?.student?.full_name}</p>
    </div>
  );
};

export default StudentInfo;
