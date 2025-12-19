import { useState } from 'react';
import { useFrappePostCall } from 'frappe-react-sdk';

interface UseOTPOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface OTPState {
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  verified: boolean;
  pinId?: string; // Store pin_id from Beem
}

export const useOTP = (options?: UseOTPOptions) => {
  const [state, setState] = useState<OTPState>({
    isLoading: false,
    error: null,
    otpSent: false,
    verified: false,
  });

  // Use Beem OTP API endpoints
  const { call: sendOTPCall } = useFrappePostCall('derevahuduma_platform.api.beem_otp.request_otp');
  const { call: verifyOTPCall } = useFrappePostCall('derevahuduma_platform.api.beem_otp.verify_otp');
  const { call: resendOTPCall } = useFrappePostCall('derevahuduma_platform.api.beem_otp.resend_otp');

  const sendOTP = async (mobile_no: string, purpose: 'registration' | 'login' | 'password_reset') => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await sendOTPCall({
        mobile_no,
        purpose,
      });

      // Store pin_id from Beem response
      setState((prev) => ({
        ...prev,
        isLoading: false,
        otpSent: true,
        error: null,
        pinId: result?.pin_id,
      }));

      options?.onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to send OTP';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      options?.onError?.(error);
      throw error;
    }
  };

  const verifyOTP = async (
    mobile_no: string,
    otp_code: string,
    purpose: 'registration' | 'login' | 'password_reset'
  ) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await verifyOTPCall({
        mobile_no,
        otp_code,
        purpose,
      });

      setState((prev) => ({
        ...prev,
        isLoading: false,
        verified: true,
        error: null,
      }));

      options?.onSuccess?.();
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Invalid OTP';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      options?.onError?.(error);
      throw error;
    }
  };

  const resendOTP = async (mobile_no: string, purpose: 'registration' | 'login' | 'password_reset') => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await resendOTPCall({
        mobile_no,
        purpose,
      });

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
      }));

      options?.onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to resend OTP';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      options?.onError?.(error);
      throw error;
    }
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
