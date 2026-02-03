import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

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

const requestOTPFunction = httpsCallable(functions, 'requestOTP');
const verifyOTPFunction = httpsCallable(functions, 'verifyOTP');

export const useOTP = (options?: UseOTPOptions) => {
  const [state, setState] = useState<OTPState>({
    isLoading: false,
    error: null,
    otpSent: false,
    verified: false,
  });

  const sendOTP = async (mobile_no: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result: any = await requestOTPFunction({ mobile_no });

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

      options?.onSuccess?.();
    } catch (error: any) {
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
    if (!state.pinId) {
      const error = new Error("pinId is not available. Please request an OTP first.");
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      options?.onError?.(error);
      throw error;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result: any = await verifyOTPFunction({ pinId: state.pinId, pin: otp_code });

      if (result.data.success) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          verified: true,
          error: null,
        }));
        options?.onSuccess?.();
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error: any) {
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
    // Re-sending is the same as sending a new one with Beem
    await sendOTP(mobile_no);
  };

  const reset = () => {
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
