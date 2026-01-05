import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFrappeAuth } from 'frappe-react-sdk';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import adminLoginBg from '@/assets/images/35.jpg';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Use frappe-react-sdk directly
  const { login: frappeLogin, logout: frappeLogout } = useFrappeAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: t('error'),
        description: 'Please enter both email and password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('[AdminLogin] Attempting login for:', email);
      
      // Use frappe-react-sdk login directly
      await frappeLogin({ username: email, password });
      
      console.log('[AdminLogin] Login successful');

      toast({
        title: t('success'),
        description: t('Welcome to Admin Portal!'),
      });

      // Reload to fetch boot info and profile
      window.location.replace('/admin');
    } catch (error: any) {
      console.error('[AdminLogin] Login error:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.message) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes('invalid') || msg.includes('incorrect') || msg.includes('wrong')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (msg.includes('user not found') || msg.includes('does not exist')) {
          errorMessage = 'No admin account found with this email.';
        } else if (msg.includes('disabled') || msg.includes('inactive')) {
          errorMessage = 'Your account has been disabled. Please contact support.';
        } else if (msg.includes('network') || msg.includes('connection')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main 
        className="flex-grow relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${adminLoginBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-black/60 to-blue-900/70" />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-white/80 hover:text-white">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/login" className="text-white/80 hover:text-white">Login</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Admin Login</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex items-center justify-center">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <Shield className="h-12 w-12 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Admin Portal</CardTitle>
                <CardDescription>Sign in to access the admin dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/auth/forgot" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <PasswordInput
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <Link to="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to main login
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLogin;
