
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Halaman tidak ditemukan</p>
        <p className="text-gray-500 mb-8">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Button 
          onClick={() => navigate("/")} 
          className="bg-primary hover:bg-primary/90"
        >
          Kembali ke Halaman Utama
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
