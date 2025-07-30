
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { loginUser } from '@/utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!identifier || !password) {
        toast.error('Silahkan isi semua field');
        setIsLoading(false);
        return;
      }
      
      console.log('Attempting login with:', identifier);
      // Use our new loginUser function to handle email/NIM/NID login
      const { data, error } = await loginUser(identifier, password);
      
      if (error) {
        throw error;
      }
      
      console.log('Login successful, navigation should happen via auth state change');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Gagal login. Periksa kredensial Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4" 
      style={{
        backgroundImage: "url('/lovable-uploads/9eb3e62e-fe00-4095-98e9-9bc47cee94aa.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <Card className="w-full max-w-md shadow-lg relative z-10">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">SIBIMA - SI</CardTitle>
          <div className="flex justify-center my-4">
    <img 
      src="/LogoSI-removebg-preview.png"
      alt="SIBIMA Logo"
      className="h-24 w-auto object-contain" // Ukuran lebih besar dan proporsional
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = '/placeholder-logo.png'; // Fallback lokal
        target.alt = 'Default Logo';
        target.className = 'h-24 w-auto opacity-80'; // Styling fallback
      }}
    />
  </div>
          <CardDescription>
            Masukkan kredensial Anda untuk mengakses sistem
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email / NIM / NID</Label>
              <Input 
                id="identifier" 
                type="text" 
                placeholder="Masukkan email, NIM, atau NID" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-green-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
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
