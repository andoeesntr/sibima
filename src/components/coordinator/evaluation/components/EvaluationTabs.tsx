
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EvaluationTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  supervisorScore: string;
  onSupervisorScoreChange: (value: string) => void;
  fieldSupervisorScore: string;
  onFieldSupervisorScoreChange: (value: string) => void;
  supervisorComments: string;
  onSupervisorCommentsChange: (value: string) => void;
  fieldSupervisorComments: string;
  onFieldSupervisorCommentsChange: (value: string) => void;
  isSubmitting: boolean;
}

const EvaluationTabs = ({
  activeTab,
  onTabChange,
  supervisorScore,
  onSupervisorScoreChange,
  fieldSupervisorScore,
  onFieldSupervisorScoreChange,
  supervisorComments,
  onSupervisorCommentsChange,
  fieldSupervisorComments,
  onFieldSupervisorCommentsChange,
  isSubmitting
}: EvaluationTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="supervisor">Pembimbing Akademik</TabsTrigger>
        <TabsTrigger value="field_supervisor">Pembimbing Lapangan</TabsTrigger>
      </TabsList>
      
      <TabsContent value="supervisor" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="supervisorScore">Nilai Pembimbing Akademik (0-100)</Label>
          <Input
            id="supervisorScore"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={supervisorScore}
            onChange={(e) => onSupervisorScoreChange(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="supervisorComments">Catatan</Label>
          <Textarea
            id="supervisorComments"
            value={supervisorComments}
            onChange={(e) => onSupervisorCommentsChange(e.target.value)}
            disabled={isSubmitting}
            rows={3}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="field_supervisor" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="fieldSupervisorScore">Nilai Pembimbing Lapangan (0-100)</Label>
          <Input
            id="fieldSupervisorScore"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={fieldSupervisorScore}
            onChange={(e) => onFieldSupervisorScoreChange(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fieldSupervisorComments">Catatan</Label>
          <Textarea
            id="fieldSupervisorComments"
            value={fieldSupervisorComments}
            onChange={(e) => onFieldSupervisorCommentsChange(e.target.value)}
            disabled={isSubmitting}
            rows={3}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default EvaluationTabs;
