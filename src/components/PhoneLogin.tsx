
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';
import { useToast } from '@/components/ui/use-toast';

const PhoneLogin: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      toast({ title: 'Error', description: 'Please enter a phone number.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
      const result = await signInWithPhoneNumber(auth, `+${phoneNumber}`, recaptchaVerifier);
      setConfirmationResult(result);
      toast({ title: 'OTP Sent', description: 'An OTP has been sent to your phone.' });
    } catch (error: any) {
      console.error("Phone sign-in error:", error);
      toast({ title: 'Error', description: error.message || 'Failed to send OTP.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp || !confirmationResult) {
      toast({ title: 'Error', description: 'Please enter the OTP.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
      toast({ title: 'Success', description: 'You have been logged in successfully.' });
      navigate('/dashboard'); // Redirect to a protected route
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to verify OTP.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4 pt-4">
      <div id="recaptcha-container"></div>
      {!confirmationResult ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <PhoneInput
              country={'tz'} // Set default country
              value={phoneNumber}
              onChange={setPhoneNumber}
              inputProps={{
                name: 'phone',
                required: true,
                autoFocus: true
              }}
              inputClass="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Button onClick={handleSendOtp} className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="otp">One-Time Password</Label>
            <Input 
              id="otp"
              type="text" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              placeholder="Enter OTP"
              required
            />
          </div>
          <Button onClick={handleVerifyOtp} className="w-full" disabled={isLoading}>
            {isLoading ? 'Verifying OTP...' : 'Verify OTP'}
          </Button>
          <Button variant="link" onClick={() => setConfirmationResult(null)} className="w-full">
            Back
          </Button>
        </>
      )}
    </div>
  );
};

export default PhoneLogin;
