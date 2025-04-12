
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, GraduationCap, User, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
          KP Submission Portal
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Sistem Monitoring Bimbingan Kerja Praktik (KP)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-bold mb-2">Mahasiswa</h2>
              <p className="text-sm text-gray-500 mb-4 text-center">
                Ajukan proposal KP
              </p>
              <Button 
                className="w-full bg-primary hover:bg-primary/90" 
                onClick={() => navigate("/student")}
              >
                Login
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="font-bold mb-2">Dosen</h2>
              <p className="text-sm text-gray-500 mb-4 text-center">
                Bimbing KP & berikan feedback
              </p>
              <Button 
                className="w-full bg-secondary hover:bg-secondary/90" 
                onClick={() => navigate("/supervisor")}
              >
                Login
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="font-bold mb-2">Koordinator</h2>
              <p className="text-sm text-gray-500 mb-4 text-center">
                Kelola jadwal & proposal KP
              </p>
              <Button 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
                onClick={() => navigate("/coordinator")}
              >
                Login
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              <h2 className="font-bold mb-2">Admin</h2>
              <p className="text-sm text-gray-500 mb-4 text-center">
                Kelola sistem & pengguna
              </p>
              <Button 
                className="w-full bg-purple-500 hover:bg-purple-600 text-white" 
                onClick={() => navigate("/admin")}
              >
                Login
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-sm mb-2">
            © {new Date().getFullYear()} KP Submission Portal - All rights reserved
          </p>
          <p className="text-gray-400 text-xs">
            Developed as a Kerja Praktek Monitoring System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
