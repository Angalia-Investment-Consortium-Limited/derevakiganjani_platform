
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import derevaLogo from '../../assets/logo.png';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const functions = getFunctions();

  const { phone, pinId, otp } = location.state || {};

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
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

    if (!phone || !pinId || !otp) {
        toast({
            title: t('error'),
            description: 'Your password reset session is invalid or has expired. Please try again.',
            variant: 'destructive',
        });
        navigate('/auth/forgot');
        return;
    }

    setIsLoading(true);

    try {
        const resetPasswordFunc = httpsCallable(functions, 'resetPassword');
        await resetPasswordFunc({
            mobile_no: phone,
            pinId,
            pin: otp,
            newPassword,
        });

        toast({
            title: t('success'),
            description: 'Password reset successfully! You can now login with your new password.',
        });
        setTimeout(() => {
            navigate('/auth/login');
        }, 2000);

    } catch (error: any) {
      let errorMessage = 'Failed to reset password. Please try again.';
      if (error.message) {
        errorMessage = error.message;
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
            Create a new password for your account associated with {phone}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
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

            <div className="text-center text-sm">
              <Link to="/login" className="text-muted-foreground hover:text-primary">
                {t('backToLogin')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
