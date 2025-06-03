
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundMessage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-10">
      <h1 className="text-2xl font-bold mb-4">Proposal tidak ditemukan</h1>
      <Button 
        onClick={() => navigate('/coordinator/proposal-review')}
        variant="outline"
        className="flex items-center"
      >
        Kembali ke Daftar
      </Button>
    </div>
  );
};

export default NotFoundMessage;
