
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { OTPInput } from '@/components/auth/OTPInput';
import { OTPTimer } from '@/components/auth/OTPTimer';

const ForgotPassword = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const { t } = useLanguage();
  const { toast } = useToast();
  const { otp: otpAuth } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (!phone) {
      toast({ title: t('error'), description: 'Please enter your phone number', variant: 'destructive' });
      return;
    }
    try {
      await otpAuth.sendOTP(phone);
      toast({ title: t('success'), description: t('otpSentSuccess') });
    } catch (error: any) {
      toast({ title: t('error'), description: error.message || t('otpSentError'), variant: 'destructive' });
    }
  };

  const handleResendOTP = async () => {
    try {
      await otpAuth.resendOTP(phone);
      toast({ title: t('success'), description: t('otpSentSuccess') });
    } catch (error: any) {
      toast({ title: t('error'), description: error.message || t('otpSentError'), variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (otp.length === 6) {
      if (otpAuth.pinId) {
        console.log('OTP complete, navigating to reset-password');
        navigate('/auth/reset', { state: { phone, pinId: otpAuth.pinId, otp } });
      } else {
        toast({ title: t('error'), description: 'Could not find OTP session. Please try again.', variant: 'destructive' });
        console.error('pinId is missing, cannot navigate to reset password');
      }
    }
  }, [otp, navigate, phone, otpAuth.pinId, t, toast]);

  const handleOtpChange = (value: string) => {
    setOtp(value);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              {otpAuth.otpSent 
                ? `Enter the OTP sent to ${phone}` 
                : 'Enter your phone number to reset your password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!otpAuth.otpSent ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="255712345678" required />
                </div>
                <Button type="submit" className="w-full" disabled={otpAuth.isLoading}>
                  {otpAuth.isLoading ? 'Sending...' : 'Send OTP'}
                </Button>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                <OTPInput
                  length={6}
                  value={otp}
                  onChange={handleOtpChange}
                />
                {otpAuth.error && <p className="text-sm font-medium text-destructive">{otpAuth.error}</p>}
                <div className="flex items-center justify-center space-x-2 text-sm">
                    <OTPTimer
                        duration={60}
                        onResend={handleResendOTP}
                    />
                </div>
                <Button variant="link" onClick={otpAuth.reset}>Change phone number</Button>
              </div>
            )}
            <div className="mt-4 text-center text-sm">
              Remembered your password? <Link to="/login" className="underline">Login</Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
