
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulating authentication API call
    setTimeout(() => {
      setIsLoading(false);
      if (username && password && role) {
        toast.success(`Berhasil login sebagai ${role}`);
        navigate(`/${role}`);
      } else {
        toast.error('Silahkan isi semua field');
      }
    }, 1000);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gray-50 p-4" 
      style={{
        backgroundImage: "linear-gradient(135deg, rgba(44, 62, 80, 0.1) 0%, rgba(39, 174, 96, 0.1) 100%)",
        backgroundSize: "cover"
      }}
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">KP Submission Portal</CardTitle>
          <CardDescription>
            Masukkan kredensial Anda untuk mengakses sistem
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="Masukkan username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Masukkan password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Masuk Sebagai</Label>
              <Select 
                value={role} 
                onValueChange={setRole}
                required
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Mahasiswa</SelectItem>
                  <SelectItem value="coordinator">Koordinator KP</SelectItem>
                  <SelectItem value="admin">Super Admin</SelectItem>
                  <SelectItem value="supervisor">Dosen Pembimbing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
