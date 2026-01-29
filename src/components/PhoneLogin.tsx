import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier } from 'firebase/auth';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PhoneLogin: React.FC = () => {
  const { 
    signInWithPhone, 
    verifyOtp, 
    phoneLoginStep, 
    otpError, 
    resetPhoneLogin,
    isLoading // Changed 'loading' to 'isLoading'
  } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [appVerifier, setAppVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
    setAppVerifier(verifier);

    return () => {
      verifier.clear();
    };
  }, []);

  const handleSendOtp = async () => {
    if (appVerifier) {
      await signInWithPhone(`+${phoneNumber}`, appVerifier);
    }
  };

  const handleVerifyOtp = async () => {
    await verifyOtp(otp);
  };

  return (
    <div className="space-y-4 pt-4">
      {phoneLoginStep === 'enter-phone' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <PhoneInput
              country={'us'}
              value={phoneNumber}
              onChange={setPhoneNumber}
              inputClass="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div id="recaptcha-container"></div>
          </div>
          <Button onClick={handleSendOtp} className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </>
      )}
      {phoneLoginStep === 'enter-otp' && (
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
          {otpError && <p className="text-sm font-medium text-destructive">{otpError}</p>}
          <Button onClick={handleVerifyOtp} className="w-full" disabled={isLoading}>
            {isLoading ? 'Verifying OTP...' : 'Verify OTP'}
          </Button>
          <Button variant="link" onClick={resetPhoneLogin} className="w-full">
            Back
          </Button>
        </>
      )}
    </div>
  );
};

export default PhoneLogin;