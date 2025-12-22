import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { useFrappePostCall } from 'frappe-react-sdk';
import  derevaLogo from '../../assets/logo.png';

const ForgotPassword = () => {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const { call: requestReset } = useFrappePostCall('derevahuduma_platform.api.auth.request_password_reset');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneOrEmail) {
      toast({
        title: t('error'),
        description: 'Please enter your phone number or email',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await requestReset({ user: phoneOrEmail });
      
      setOtpSent(true);
      toast({
        title: t('success'),
        description: 'Password reset OTP has been sent to your phone. Please check your messages.',
      });
      
      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        navigate('/auth/reset', { 
          state: { 
            mobile_no: result?.mobile_no || phoneOrEmail 
          } 
        });
      }, 2000);
    } catch (error: any) {
      // Parse error message
      let errorMessage = 'Failed to send reset OTP. Please try again.';
      
      if (error.message) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes('user not found') || msg.includes('does not exist')) {
          errorMessage = 'No account found with this phone number or email. Please check and try again.';
        } else if (msg.includes('no mobile number')) {
          errorMessage = 'No mobile number associated with this account. Please contact support.';
        } else if (msg.includes('network') || msg.includes('connection')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
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

  const handleResend = () => {
    setOtpSent(false);
    setPhoneOrEmail('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src={derevaLogo} alt="Dereva Kiganjani" className="h-[140px] w-auto mx-auto" />
          </div>
          <CardTitle className="text-2xl text-center">{t('forgotPassword')}</CardTitle>
          <CardDescription className="text-center">
            {otpSent 
              ? 'OTP sent! Redirecting to reset password page...' 
              : 'Enter your phone number or email to receive a password reset OTP'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Phone Number or Email</Label>
                <Input
                  id="contact"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="+255 712 345 678 or email@example.com"
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the phone number or email associated with your account
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending OTP...' : 'Send Reset OTP'}
              </Button>

              <div className="text-center text-sm space-y-2">
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('backToLogin')}
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg text-sm text-center space-y-2">
                <p className="text-muted-foreground">
                  A password reset OTP has been sent to your phone number via SMS.
                </p>
                <p className="text-muted-foreground">
                  You will be redirected to the reset password page shortly.
                </p>
              </div>

              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleResend}
                disabled={isLoading}
              >
                Try Different Number
              </Button>

              <div className="text-center text-sm">
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('backToLogin')}
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
