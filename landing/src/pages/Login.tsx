import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import type { EmployerProfile } from '@/types/auth';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { login } = useAuth();

  // Don't auto-redirect on mount - let the login handler control the redirect
  // This prevents issues with employer verification checking

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user: loggedInUser, profile } = await login({
        usr: phoneNumber,
        pwd: password,
      });

      toast({
        title: t('success'),
        description: "Welcome back to Dereva Huduma!",
      });

      // Determine redirect based on user type and verification status
      const from = (location.state as any)?.from?.pathname;
      
      // Determine user type from multiple sources
      const userType = loggedInUser.user_type || 
                      (loggedInUser.roles && loggedInUser.roles.length > 0 ? loggedInUser.roles[0] : null);
      
      console.log('Login successful:', { userType, profile, loggedInUser });
      
      if (from) {
        // If there's a specific page they were trying to access, go there
        navigate(from, { replace: true });
      } else if (userType === 'Employer') {
        // Check employer verification status
        const employerProfile = profile as EmployerProfile;
        
        console.log('Employer profile:', employerProfile);
        
        // Check verification status - be explicit about what we're checking
        // Handle both boolean and number types (Frappe can return 0/1 for boolean fields)
        const isVerified = employerProfile && (
          employerProfile.verified === true || 
          (employerProfile.verified as any) === 1 ||
          employerProfile.verification_status === 'Verified'
        );
        
        console.log('Employer verification status:', { 
          verified: employerProfile?.verified, 
          verification_status: employerProfile?.verification_status,
          isVerified 
        });
        
        if (isVerified) {
          console.log('Redirecting to employer dashboard');
          navigate('/employer/dashboard', { replace: true });
        } else {
          console.log('Redirecting to pending verification');
          navigate('/employer/pending-verification', { replace: true });
        }
      } else if (userType === 'Admin' || userType === 'Staff') {
        console.log('Redirecting to admin');
        navigate('/admin', { replace: true });
      } else {
        // Driver or default
        console.log('Redirecting to driver dashboard');
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      // Parse error message to provide specific feedback
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.message) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes('invalid') && (msg.includes('credentials') || msg.includes('password') || msg.includes('username'))) {
          errorMessage = 'Invalid phone number or password. Please try again.';
        } else if (msg.includes('user not found') || msg.includes('does not exist')) {
          errorMessage = 'No account found with this phone number. Please register first.';
        } else if (msg.includes('disabled') || msg.includes('inactive')) {
          errorMessage = 'Your account has been disabled. Please contact support.';
        } else if (msg.includes('network') || msg.includes('connection')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (msg.includes('failed to load user data')) {
          errorMessage = 'Unable to load your profile. Please try again or contact support.';
        } else {
          // Use the original error message if it's specific
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

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement OTP sending via Frappe API
      // For now, just show success message
      setOtpSent(true);
      toast({
        title: t('success'),
        description: "Please check your phone for the verification code",
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || 'Failed to send OTP',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement OTP verification via Frappe API
      toast({
        title: t('success'),
        description: "Welcome to Dereva Huduma!",
      });
      navigate('/profile-setup');
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || 'Invalid OTP',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img src="/logo.png" alt="Dereva Kiganjani" className="h-[140px] w-auto mx-auto" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to access your driver services</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="otp">OTP</TabsTrigger>
            </TabsList>
            
            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phoneNumber')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+255 712 345 678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/auth/forgot" className="text-xs text-primary hover:underline">
                      {t('forgotPassword')}?
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
                  {isLoading ? 'Logging in...' : t('login')}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="otp">
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone-otp">{t('phoneNumber')}</Label>
                    <Input
                      id="phone-otp"
                      type="tel"
                      placeholder="+255 712 345 678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send OTP'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setOtpSent(false)}
                  >
                    {t('back')}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t('alreadyHaveAccount')} </span>
            <Link to="/register" className="text-primary hover:underline font-medium">
              {t('createAccount')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
