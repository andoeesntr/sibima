
interface ProposalDescriptionProps {
  description: string | null;
}

const ProposalDescription = ({ description }: ProposalDescriptionProps) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Deskripsi</h3>
      <p className="text-gray-700">{description || '-'}</p>
    </div>
  );
};

export default ProposalDescription;
