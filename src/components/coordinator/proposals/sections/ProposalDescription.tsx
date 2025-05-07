
interface ProposalDescriptionProps {
  description: string;
}

const ProposalDescription = ({ description }: ProposalDescriptionProps) => {
  // Split description by newlines and render each paragraph
  const paragraphs = description?.split('\n').filter(Boolean) || [];
  
  return (
    <div>
      <h3 className="font-medium mb-2">Deskripsi</h3>
      {paragraphs.length > 0 ? (
        <div className="space-y-2 text-gray-600">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">{description || '-'}</p>
      )}
    </div>
  );
};

export default ProposalDescription;
