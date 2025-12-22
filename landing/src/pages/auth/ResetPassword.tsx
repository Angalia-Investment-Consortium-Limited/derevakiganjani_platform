import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFrappePostCall } from 'frappe-react-sdk';
import derevaLogo from '../../assets/logo.png';

const ResetPassword = () => {
  const [mobileNo, setMobileNo] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const { call: resetPassword } = useFrappePostCall('derevahuduma_platform.api.auth.reset_password');

  // Get mobile number from navigation state if available
  useEffect(() => {
    if (location.state?.mobile_no) {
      setMobileNo(location.state.mobile_no);
    }
  }, [location.state]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mobileNo || !otp || !newPassword || !confirmPassword) {
      toast({
        title: t('error'),
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t('error'),
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: t('error'),
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({
        mobile_no: mobileNo,
        otp: otp,
        new_password: newPassword
      });

      toast({
        title: t('success'),
        description: 'Password reset successfully! You can now login with your new password.',
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      // Parse error message
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.message) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes('invalid') && msg.includes('otp')) {
          errorMessage = 'Invalid or expired OTP. Please request a new one.';
        } else if (msg.includes('expired')) {
          errorMessage = 'OTP has expired. Please request a new one.';
        } else if (msg.includes('user not found')) {
          errorMessage = 'User not found. Please check your phone number.';
        } else if (msg.includes('password')) {
          if (msg.includes('8 characters') || msg.includes('too short')) {
            errorMessage = 'Password must be at least 8 characters long.';
          } else if (msg.includes('uppercase')) {
            errorMessage = 'Password must contain at least one uppercase letter.';
          } else if (msg.includes('lowercase')) {
            errorMessage = 'Password must contain at least one lowercase letter.';
          } else if (msg.includes('number') || msg.includes('digit')) {
            errorMessage = 'Password must contain at least one number.';
          } else {
            errorMessage = error.message;
          }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src={derevaLogo} alt="Dereva Kiganjani" className="h-[140px] w-auto mx-auto" />
          </div>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter the OTP sent to your phone and create a new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mobile"
                type="tel"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                placeholder="+255 712 345 678"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">
                Verification Code (OTP) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
                disabled={isLoading}
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code sent to your phone
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">
                New Password <span className="text-destructive">*</span>
              </Label>
              <PasswordInput
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Button>

            <div className="text-center text-sm space-y-2">
              <p className="text-muted-foreground">
                Didn't receive the code?{' '}
                <Link to="/auth/forgot" className="text-primary hover:underline">
                  Request new OTP
                </Link>
              </p>
              <p>
                <Link to="/login" className="text-muted-foreground hover:text-primary">
                  {t('backToLogin')}
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
