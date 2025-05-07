
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, FileText, MoreHorizontal, Trash } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDate } from '@/services/mockData';
import { deleteGuideDocument } from '@/services/guideService';
import { GuideDocument } from '@/types';

interface DocumentListItemProps {
  document: GuideDocument;
  onDelete: (id: string) => void;
  onPreview: (fileUrl: string) => void;
}

const DocumentListItem = ({ document, onDelete, onPreview }: DocumentListItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deleteGuideDocument(document.id);
    setIsDeleting(false);
    if (success) {
      onDelete(document.id);
    }
  };

  return (
    <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-start gap-4">
        <FileText className="h-10 w-10 text-blue-500" />
        <div>
          <h3 className="font-medium">{document.title}</h3>
          <p className="text-sm text-gray-500">
            Upload: {formatDate(document.uploadDate)}
          </p>
          <p className="text-sm text-gray-600 mt-1 max-w-md">
            {document.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPreview(document.fileUrl)}
        >
          <Eye size={14} className="mr-1" /> Preview
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isDeleting}>
              <MoreHorizontal size={16} />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-red-600"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash size={14} className="mr-2" /> {isDeleting ? 'Menghapus...' : 'Hapus'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default DocumentListItem;
