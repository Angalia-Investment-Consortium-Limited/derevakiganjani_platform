import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, ArrowLeft } from 'lucide-react';
import type { EmployerProfile } from '@/types/auth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import employerLoginBg from '@/assets/images/30.jpg';

const EmployerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { login } = useAuth();

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
      console.log('[EmployerLogin] Attempting login for:', email);
      
      const { profile } = await login({
        usr: email,
        pwd: password,
      });

      console.log('[EmployerLogin] Login successful, profile:', profile);

      toast({
        title: t('success'),
        description: t('Welcome back!'),
      });

      // Check employer verification status
      const employerProfile = profile as EmployerProfile;
      const isVerified = employerProfile && (
        employerProfile.verified === true || 
        (employerProfile.verified as any) === 1 ||
        employerProfile.verification_status === 'Verified'
      );

      // Navigate based on verification status
      if (isVerified) {
        navigate('/employer/dashboard', { replace: true });
      } else {
        navigate('/employer/pending-verification', { replace: true });
      }
    } catch (error: any) {
      console.error('[EmployerLogin] Login error:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.message) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes('invalid') || msg.includes('incorrect') || msg.includes('wrong')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (msg.includes('user not found') || msg.includes('does not exist')) {
          errorMessage = 'No employer account found with this email.';
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
        style={{ backgroundImage: `url(${employerLoginBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/70 via-black/60 to-orange-900/70" />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-white/80 hover:text-white">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/landing/ingia" className="text-white/80 hover:text-white">Login</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Employer Login</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex items-center justify-center">
                  <div className="bg-orange-100 p-4 rounded-full">
                    <Building2 className="h-12 w-12 text-orange-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Employer Login</CardTitle>
                <CardDescription>Sign in to manage your recruitment</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="employer@company.com"
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
                
                <div className="mt-6 space-y-3">
                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Don't have an account? </span>
                    <Link to="/ajiri-dereva/register" className="text-primary hover:underline font-medium">
                      Register as Employer
                    </Link>
                  </div>
                  <div className="text-center">
                    <Link to="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back to main login
                    </Link>
                  </div>
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

export default EmployerLogin;
