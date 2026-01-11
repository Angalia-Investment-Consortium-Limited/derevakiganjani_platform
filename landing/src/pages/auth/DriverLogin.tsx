import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFrappeAuth } from 'frappe-react-sdk';
import { useOTP } from '@/hooks/useOTP';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import driverLoginBg from '@/assets/images/25.jpg';

const DriverLogin = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Use frappe-react-sdk directly
  const { login: frappeLogin, updateCurrentUser } = useFrappeAuth();
  const { sendOTP, verifyOTP, isLoading: otpLoading } = useOTP();

  const handlePasswordLogin = async (e: React.FormEvent) => {
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
      console.log('[DriverLogin] Attempting login for:', email);
      
      // Use frappe-react-sdk login directly
      await frappeLogin({ username: email, password });
      
      console.log('[DriverLogin] Login successful');

      toast({
        title: t('success'),
        description: t('Welcome back!'),
      });

      // Reload to fetch boot info
      window.location.replace('/dashboard');
    } catch (error: any) {
      console.error('[DriverLogin] Login error:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.message) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes('invalid') || msg.includes('incorrect') || msg.includes('wrong')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (msg.includes('user not found') || msg.includes('does not exist')) {
          errorMessage = 'No account found with this email. Please register first.';
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

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast({
        title: t('error'),
        description: 'Please enter your phone number',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('[DriverLogin] Sending OTP to:', phoneNumber);
      
      await sendOTP(phoneNumber, 'login');
      
      setOtpSent(true);
      toast({
        title: t('success'),
        description: 'OTP sent successfully to your phone',
      });
    } catch (error: any) {
      console.error('[DriverLogin] OTP send error:', error);
      toast({
        title: t('error'),
        description: error.message || 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      toast({
        title: t('error'),
        description: 'Please enter the OTP',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('[DriverLogin] Verifying OTP:', otp);
      
      // Verify OTP (backend creates session)
      await verifyOTP(phoneNumber, otp, 'login');
      
      // Update auth state
      await updateCurrentUser();
      
      toast({
        title: t('success'),
        description: 'Login successful!',
      });

      // Reload to fetch boot info
      window.location.replace('/landing/dashboard');
    } catch (error: any) {
      console.error('[DriverLogin] OTP verification error:', error);
      toast({
        title: t('error'),
        description: error.message || 'Invalid OTP. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main 
        className="flex-grow relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${driverLoginBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/70 via-black/60 to-green-900/70" />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-white/80 hover:text-white">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/ingia" className="text-white/80 hover:text-white">Login</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Driver Login</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex items-center justify-center">
                  <div className="bg-green-100 p-4 rounded-full">
                    <User className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Driver Login</CardTitle>
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
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="example@email.com"
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
                        {isLoading ? 'Logging in...' : 'Login'}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="otp">
                    {!otpSent ? (
                      <form onSubmit={handleSendOTP} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone-otp">Phone Number</Label>
                          <Input
                            id="phone-otp"
                            type="tel"
                            placeholder="255712345678"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={otpLoading}>
                          {otpLoading ? 'Sending...' : 'Send OTP'}
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
                        <Button type="submit" className="w-full" disabled={otpLoading}>
                          {otpLoading ? 'Verifying...' : 'Verify & Login'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => setOtpSent(false)}
                        >
                          Back
                        </Button>
                      </form>
                    )}
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6 space-y-3">
                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Don't have an account? </span>
                    <Link to="/register" className="text-primary hover:underline font-medium">
                      Register
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

export default DriverLogin;
