
interface ProposalDescriptionProps {
  description: string;
}

const ProposalDescription = ({ description }: ProposalDescriptionProps) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Deskripsi</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default ProposalDescription;
