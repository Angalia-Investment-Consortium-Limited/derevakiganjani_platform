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

  // Use Beem OTP API endpoints with proper frappe-react-sdk hooks
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

      // Check if the API call was successful
      if (result?.success === false) {
        throw new Error(result.message || 'Failed to send OTP');
      }

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
      // Extract the actual error message from Frappe error response
      let errorMessage = 'Failed to send OTP';
      
      // Try to get message from _server_messages (Frappe format)
      if (error?._server_messages) {
        try {
          const messages = JSON.parse(error._server_messages);
          if (Array.isArray(messages) && messages.length > 0) {
            const firstMessage = JSON.parse(messages[0]);
            errorMessage = firstMessage.message || errorMessage;
          }
        } catch (e) {
          // If parsing fails, fall back to other methods
        }
      }
      
      // Fallback to exception message
      if (errorMessage === 'Failed to send OTP' && error?.exception) {
        const match = error.exception.match(/ValidationError: (.+?)\\n/);
        if (match && match[1]) {
          errorMessage = match[1];
        }
      }
      
      // Final fallback to error.message
      if (errorMessage === 'Failed to send OTP' && error?.message && error.message !== 'There was an error.') {
        errorMessage = error.message;
      }
      
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      // Create a new error with the extracted message
      const enhancedError = new Error(errorMessage);
      Object.assign(enhancedError, error);
      
      options?.onError?.(enhancedError);
      throw enhancedError;
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
      // Extract the actual error message from Frappe error response
      let errorMessage = 'Invalid OTP';
      
      // Try to get message from _server_messages (Frappe format)
      if (error?._server_messages) {
        try {
          const messages = JSON.parse(error._server_messages);
          if (Array.isArray(messages) && messages.length > 0) {
            const firstMessage = JSON.parse(messages[0]);
            errorMessage = firstMessage.message || errorMessage;
          }
        } catch (e) {
          // If parsing fails, fall back to other methods
        }
      }
      
      // Fallback to exception message
      if (errorMessage === 'Invalid OTP' && error?.exception) {
        const match = error.exception.match(/ValidationError: (.+?)\\n/);
        if (match && match[1]) {
          errorMessage = match[1];
        }
      }
      
      // Final fallback to error.message
      if (errorMessage === 'Invalid OTP' && error?.message && error.message !== 'There was an error.') {
        errorMessage = error.message;
      }
      
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      // Create a new error with the extracted message
      const enhancedError = new Error(errorMessage);
      Object.assign(enhancedError, error);
      
      options?.onError?.(enhancedError);
      throw enhancedError;
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
      // Extract the actual error message from Frappe error response
      let errorMessage = 'Failed to resend OTP';
      
      // Try to get message from _server_messages (Frappe format)
      if (error?._server_messages) {
        try {
          const messages = JSON.parse(error._server_messages);
          if (Array.isArray(messages) && messages.length > 0) {
            const firstMessage = JSON.parse(messages[0]);
            errorMessage = firstMessage.message || errorMessage;
          }
        } catch (e) {
          // If parsing fails, fall back to other methods
        }
      }
      
      // Fallback to exception message
      if (errorMessage === 'Failed to resend OTP' && error?.exception) {
        const match = error.exception.match(/ValidationError: (.+?)\\n/);
        if (match && match[1]) {
          errorMessage = match[1];
        }
      }
      
      // Final fallback to error.message
      if (errorMessage === 'Failed to resend OTP' && error?.message && error.message !== 'There was an error.') {
        errorMessage = error.message;
      }
      
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      // Create a new error with the extracted message
      const enhancedError = new Error(errorMessage);
      Object.assign(enhancedError, error);
      
      options?.onError?.(enhancedError);
      throw enhancedError;
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
