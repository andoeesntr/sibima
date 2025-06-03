
import { FileText } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="col-span-2 text-center py-10 border rounded-lg">
      <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
      <h3 className="text-lg font-medium text-gray-900">Tidak ada dokumen</h3>
      <p className="text-gray-500">
        Belum ada dokumen panduan yang tersedia
      </p>
    </div>
  );
};

export default EmptyState;
