
interface CompanyInfoProps {
  companyName: string | null | undefined;
}

const CompanyInfo = ({ companyName }: CompanyInfoProps) => {
  if (!companyName) {
    return null;
  }
  
  return (
    <div>
      <h3 className="font-medium mb-2">Perusahaan/Instansi</h3>
      <p className="text-gray-600">{companyName}</p>
    </div>
  );
};

export default CompanyInfo;
