
import ProposalDescription from './ProposalDescription';
import ProposalMetadata from './ProposalMetadata';
import SupervisorsList from './SupervisorsList';
import { Supervisor } from '@/services/supervisorService';

interface ProposalInfoProps {
  companyName: string | null;
  description: string | null;
  createdAt: string;
  updatedAt?: string | null;
  supervisors?: Supervisor[];
  formatDate: (date: string | Date) => string;
}

const ProposalInfo = ({ 
  companyName, 
  description, 
  createdAt, 
  updatedAt, 
  supervisors = [],
  formatDate 
}: ProposalInfoProps) => {
  return (
    <div className="space-y-6">
      <ProposalDescription description={description} />
      
      <ProposalMetadata 
        companyName={companyName}
        createdAt={createdAt}
        updatedAt={updatedAt}
        formatDate={formatDate}
      />
      
      <SupervisorsList supervisors={supervisors} />
    </div>
  );
};

export default ProposalInfo;
