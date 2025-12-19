/**
 * useJiTesti Hook
 * 
 * Custom React hook for JiTesti (Driver Testing) module
 * Provides methods to interact with JiTesti API endpoints
 */

import { useState } from 'react';
import { useFrappePostCall } from 'frappe-react-sdk';
import type {
  TestCategory,
  CategoryDetails,
  TestQuestion,
  PaymentFormData,
  PaymentResponse,
  PaymentStatusResponse,
  StartTestResponse,
  SubmitAnswerResponse,
  CompleteTestResponse,
  TestResultResponse,
  CertificateResponse,
  CategoriesResponse,
  CategoryDetailsResponse,
  QuestionsResponse,
  QuestionResponse,
  PendingPaymentsResponse,
  AnswerOption
} from '@/types/jitesti';

interface UseJiTestiOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useJiTesti = (options?: UseJiTestiOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // Category Methods
  // ============================================================================

  const { call: getCategoriesCall } = useFrappePostCall<CategoriesResponse>(
    'derevahuduma_platform.api.jitesti.get_categories'
  );

  const getCategories = async (): Promise<TestCategory[]> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[useJiTesti] Calling get_categories API...');
      const result = await getCategoriesCall({});
      console.log('[useJiTesti] API response:', result);
      
      if (result?.success && result.categories) {
        console.log('[useJiTesti] Categories fetched successfully:', result.categories.length);
        return result.categories;
      }
      
      const errorMsg = result?.message || 'Failed to fetch categories';
      console.error('[useJiTesti] API returned error:', errorMsg);
      throw new Error(errorMsg);
    } catch (err: any) {
      console.error('[useJiTesti] Exception caught:', err);
      
      // Extract proper error message
      let errorMessage = 'Failed to fetch categories';
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.error) {
        errorMessage = err.error;
      } else if (err?.exc) {
        // Frappe error format
        errorMessage = err.exc;
      }
      
      console.error('[useJiTesti] Processed error message:', errorMessage);
      setError(errorMessage);
      options?.onError?.(new Error(errorMessage));
      
      // Throw a proper Error object with string message
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const { call: getCategoryDetailsCall } = useFrappePostCall<CategoryDetailsResponse>(
    'derevahuduma_platform.api.jitesti.get_category_details'
  );

  const getCategoryDetails = async (categoryCode: string): Promise<CategoryDetails> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getCategoryDetailsCall({ category_code: categoryCode });
      
      if (result?.success && result.category) {
        return result.category;
      }
      
      throw new Error(result?.message || 'Failed to fetch category details');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch category details';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Question Management Methods (Admin)
  // ============================================================================

  const { call: createQuestionCall } = useFrappePostCall<QuestionResponse>(
    'derevahuduma_platform.api.jitesti.create_question'
  );

  const createQuestion = async (questionData: any): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await createQuestionCall({ data: JSON.stringify(questionData) });
      
      if (result?.success && result.question_id) {
        options?.onSuccess?.();
        return result.question_id;
      }
      
      throw new Error(result?.message || 'Failed to create question');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create question';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const { call: updateQuestionCall } = useFrappePostCall<QuestionResponse>(
    'derevahuduma_platform.api.jitesti.update_question'
  );

  const updateQuestion = async (questionId: string, questionData: any): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await updateQuestionCall({
        question_id: questionId,
        data: JSON.stringify(questionData)
      });
      
      if (result?.success) {
        options?.onSuccess?.();
        return;
      }
      
      throw new Error(result?.message || 'Failed to update question');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update question';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const { call: deleteQuestionCall } = useFrappePostCall<QuestionResponse>(
    'derevahuduma_platform.api.jitesti.delete_question'
  );

  const deleteQuestion = async (questionId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await deleteQuestionCall({ question_id: questionId });
      
      if (result?.success) {
        options?.onSuccess?.();
        return;
      }
      
      throw new Error(result?.message || 'Failed to delete question');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete question';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const { call: getQuestionsCall } = useFrappePostCall<QuestionsResponse>(
    'derevahuduma_platform.api.jitesti.get_questions'
  );

  const getQuestions = async (categoryCode?: string, filters?: any): Promise<TestQuestion[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getQuestionsCall({
        category_code: categoryCode,
        filters: filters ? JSON.stringify(filters) : undefined
      });
      
      if (result?.success && result.questions) {
        return result.questions;
      }
      
      throw new Error(result?.message || 'Failed to fetch questions');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch questions';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Payment Methods
  // ============================================================================

  const { call: createPaymentCall } = useFrappePostCall<PaymentResponse>(
    'derevahuduma_platform.api.jitesti.create_payment'
  );

  const createPayment = async (paymentData: PaymentFormData): Promise<PaymentResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await createPaymentCall({
        category_code: paymentData.category_code,
        payment_method: paymentData.payment_method,
        reference_number: paymentData.reference_number,
        payment_proof: paymentData.payment_proof
      });
      
      if (result?.success) {
        options?.onSuccess?.();
        return result;
      }
      
      throw new Error(result?.message || 'Failed to create payment');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create payment';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const { call: getPaymentStatusCall } = useFrappePostCall<PaymentStatusResponse>(
    'derevahuduma_platform.api.jitesti.get_payment_status'
  );

  const getPaymentStatus = async (paymentId: string): Promise<PaymentStatusResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getPaymentStatusCall({ payment_id: paymentId });
      
      if (result?.success) {
        return result;
      }
      
      throw new Error(result?.message || 'Failed to fetch payment status');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch payment status';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const { call: verifyPaymentCall } = useFrappePostCall<PaymentResponse>(
    'derevahuduma_platform.api.jitesti.verify_payment'
  );

  const verifyPayment = async (paymentId: string, status: 'Verified' | 'Rejected', notes?: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await verifyPaymentCall({
        payment_id: paymentId,
        status,
        notes
      });
      
      if (result?.success) {
        options?.onSuccess?.();
        return;
      }
      
      throw new Error(result?.message || 'Failed to verify payment');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to verify payment';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const { call: getPendingPaymentsCall } = useFrappePostCall<PendingPaymentsResponse>(
    'derevahuduma_platform.api.jitesti.get_pending_payments'
  );

  const getPendingPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getPendingPaymentsCall({});
      
      if (result?.success && result.payments) {
        return result.payments;
      }
      
      throw new Error(result?.message || 'Failed to fetch pending payments');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch pending payments';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Test Flow Methods
  // ============================================================================

  const { call: startTestCall } = useFrappePostCall<StartTestResponse>(
    'derevahuduma_platform.api.jitesti.start_test'
  );

  const startTest = async (categoryCode: string, paymentRef: string): Promise<StartTestResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await startTestCall({
        category_code: categoryCode,
        payment_ref: paymentRef
      });
      
      if (result?.success) {
        options?.onSuccess?.();
        return result;
      }
      
      throw new Error(result?.message || 'Failed to start test');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to start test';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const { call: submitAnswerCall } = useFrappePostCall<SubmitAnswerResponse>(
    'derevahuduma_platform.api.jitesti.submit_answer'
  );

  const submitAnswer = async (attemptId: string, questionId: string, answer: AnswerOption): Promise<void> => {
    try {
      const result = await submitAnswerCall({
        attempt_id: attemptId,
        question_id: questionId,
        answer
      });
      
      if (!result?.success) {
        throw new Error(result?.message || 'Failed to submit answer');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to submit answer';
      setError(errorMessage);
      // Don't call onError for individual answer submissions
      throw err;
    }
  };

  const { call: completeTestCall } = useFrappePostCall<CompleteTestResponse>(
    'derevahuduma_platform.api.jitesti.complete_test'
  );

  const completeTest = async (attemptId: string): Promise<CompleteTestResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await completeTestCall({ attempt_id: attemptId });
      
      if (result?.success) {
        options?.onSuccess?.();
        return result;
      }
      
      throw new Error(result?.message || 'Failed to complete test');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to complete test';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const { call: getTestResultCall } = useFrappePostCall<TestResultResponse>(
    'derevahuduma_platform.api.jitesti.get_test_result'
  );

  const getTestResult = async (attemptId: string): Promise<TestResultResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getTestResultCall({ attempt_id: attemptId });
      
      if (result?.success) {
        return result;
      }
      
      throw new Error(result?.message || 'Failed to fetch test result');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch test result';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Certificate Methods
  // ============================================================================

  const { call: generateCertificateCall } = useFrappePostCall<CertificateResponse>(
    'derevahuduma_platform.api.jitesti.generate_certificate'
  );

  const generateCertificate = async (attemptId: string): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await generateCertificateCall({ attempt_id: attemptId });
      
      if (result?.success && result.certificate_id) {
        options?.onSuccess?.();
        return result.certificate_id;
      }
      
      throw new Error(result?.message || 'Failed to generate certificate');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to generate certificate';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const { call: getCertificateCall } = useFrappePostCall<CertificateResponse>(
    'derevahuduma_platform.api.jitesti.get_certificate'
  );

  const getCertificate = async (certificateId: string): Promise<CertificateResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getCertificateCall({ certificate_id: certificateId });
      
      if (result?.success) {
        return result;
      }
      
      throw new Error(result?.message || 'Failed to fetch certificate');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch certificate';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const { call: downloadCertificateCall } = useFrappePostCall(
    'derevahuduma_platform.api.jitesti.download_certificate'
  );

  const downloadCertificate = async (certificateId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await downloadCertificateCall({ certificate_id: certificateId });
      
      if (result?.success) {
        options?.onSuccess?.();
        // TODO: Handle PDF download
        return;
      }
      
      throw new Error(result?.message || 'Failed to download certificate');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to download certificate';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const { call: revokeCertificateCall } = useFrappePostCall<CertificateResponse>(
    'derevahuduma_platform.api.jitesti.revoke_certificate'
  );

  const revokeCertificate = async (certificateId: string, reason: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await revokeCertificateCall({
        certificate_id: certificateId,
        reason
      });
      
      if (result?.success) {
        options?.onSuccess?.();
        return;
      }
      
      throw new Error(result?.message || 'Failed to revoke certificate');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to revoke certificate';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Utility Methods
  // ============================================================================

  const reset = () => {
    setLoading(false);
    setError(null);
  };

  // ============================================================================
  // Return Hook Interface
  // ============================================================================

  return {
    // State
    loading,
    error,
    
    // Category methods
    getCategories,
    getCategoryDetails,
    
    // Question methods (Admin)
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestions,
    
    // Payment methods
    createPayment,
    getPaymentStatus,
    verifyPayment,
    getPendingPayments,
    
    // Test flow methods
    startTest,
    submitAnswer,
    completeTest,
    getTestResult,
    
    // Certificate methods
    generateCertificate,
    getCertificate,
    downloadCertificate,
    revokeCertificate,
    
    // Utility
    reset
  };
};
