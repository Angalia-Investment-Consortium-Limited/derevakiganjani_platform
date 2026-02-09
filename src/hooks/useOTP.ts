import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '../lib/firebase';

interface UseOTPOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface OTPState {
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  verified: boolean;
  pinId?: string;
}

const functions = getFunctions(firebaseApp);

export const useOTP = (options?: UseOTPOptions) => {
  const [state, setState] = useState<OTPState>({
    isLoading: false,
    error: null,
    otpSent: false,
    verified: false,
  });

  console.log('useOTP hook initialized with state:', state);

  const sendOTP = async (mobile_no: string) => {
    console.log('sendOTP called with mobile_no:', mobile_no);
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const requestOTPFunc = httpsCallable(functions, 'requestOTP');
      const result: any = await requestOTPFunc({ mobile_no });

      console.log('requestOTP result:', result);

      if (!result.data.success) {
        throw new Error('Failed to send OTP');
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        otpSent: true,
        error: null,
        pinId: result.data.pinId,
      }));

      console.log('sendOTP successful, new state:', { ...state, otpSent: true, pinId: result.data.pinId });
      options?.onSuccess?.();
    } catch (error: any) {
      console.error('Error in sendOTP:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to send OTP',
      }));

      options?.onError?.(error);
      throw error;
    }
  };

  const verifyOTP = async (otp_code: string) => {
    console.log('verifyOTP called with otp_code:', otp_code);
    if (!state.pinId) {
      const error = new Error("pinId is not available. Please request an OTP first.");
      console.error(error.message);
      setState((prev) => ({ ...prev, error: error.message }));
      options?.onError?.(error);
      throw error;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const verifyOTPFunc = httpsCallable(functions, 'verifyOTP');
      const result: any = await verifyOTPFunc({ pinId: state.pinId, pin: otp_code });
      console.log('verifyOTP result:', result);

      if (result.data.success) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          verified: true,
          error: null,
        }));
        console.log('verifyOTP successful, new state:', { ...state, verified: true });
        options?.onSuccess?.();
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error: any) {
      console.error('Error in verifyOTP:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Invalid OTP',
      }));

      options?.onError?.(error);
      throw error;
    }
  };

  const resendOTP = async (mobile_no: string) => {
    console.log('resendOTP called with mobile_no:', mobile_no);
    await sendOTP(mobile_no);
  };

  const reset = () => {
    console.log('reset called, resetting state');
    setState({
      isLoading: false,
      error: null,
      otpSent: false,
      verified: false,
    });
  };

  return {
    ...state,
    sendOTP,
    verifyOTP,
    resendOTP,
    reset,
  };
};
