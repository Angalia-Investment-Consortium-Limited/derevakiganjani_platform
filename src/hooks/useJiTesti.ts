import { useState, useEffect } from 'react';
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
  CategoryDetailsResponse,
  QuestionsResponse,
  QuestionResponse,
  PendingPaymentsResponse,
  AnswerOption
} from '@/types/jitesti';

// Mock Data
const MOCK_CATEGORIES: TestCategory[] = [
  {
    name: 'CAT-001',
    category_code: 'DRIVING-LICENSE-A',
    name_en: 'Category A License Test',
    name_sw: 'Mtihani wa Leseni Daraja A',
    description_en: 'Test for motorcycles and auto-rickshaws.',
    description_sw: 'Mtihani wa pikipiki na bajaji.',
    price: 25000,
    pass_mark: 70,
    duration_minutes: 45,
    total_questions: 30,
    display_order: 1,
    is_active: 1,
  }
];

const MOCK_QUESTIONS: TestQuestion[] = [
  {
    question_id: 'Q-001',
    category_code: 'DRIVING-LICENSE-A',
    question_text_en: 'What does a red traffic light mean?',
    question_text_sw: 'Taa nyekundu ya barabarani inamaanisha nini?',
    question_type: 'Multiple Choice',
    options: [
      { id: 'A', text_en: 'Stop', text_sw: 'Simama' },
      { id: 'B', text_en: 'Go', text_sw: 'Endelea' },
      { id: 'C', text_en: 'Slow Down', text_sw: 'Punguza mwendo' },
    ],
    correct_answer: 'A',
    is_active: 1,
  }
];

interface UseJiTestiOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useJiTesti = (options?: UseJiTestiOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useCategoriesList = () => {
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }, []);
    return { data: MOCK_CATEGORIES, isLoading, error: null, mutate: () => {} };
  };

  const getCategoryDetails = async (categoryCode: string): Promise<CategoryDetails> => {
    setLoading(true);
    return new Promise(resolve => setTimeout(() => {
      setLoading(false);
      const category = MOCK_CATEGORIES.find(c => c.category_code === categoryCode);
      resolve({ ...category, has_paid: false, can_retake: true } as CategoryDetails);
    }, 500));
  };

  const createPayment = async (paymentData: PaymentFormData): Promise<PaymentResponse> => {
    setLoading(true);
    console.log('Creating payment:', paymentData);
    return new Promise(resolve => setTimeout(() => {
      setLoading(false);
      resolve({ success: true, message: 'Payment initiated', payment_id: 'PAY-MOCK-001', status: 'Pending' });
    }, 1000));
  };

  const getPaymentStatus = async (paymentId: string): Promise<PaymentStatusResponse> => {
    setLoading(true);
    return new Promise(resolve => setTimeout(() => {
      setLoading(false);
      resolve({ success: true, status: 'Verified', message: 'Payment is verified' });
    }, 1000));
  };

  const startTest = async (categoryCode: string, paymentRef: string): Promise<StartTestResponse> => {
    setLoading(true);
    console.log(`Starting test for ${categoryCode} with ref ${paymentRef}`);
    return new Promise(resolve => setTimeout(() => {
      setLoading(false);
      resolve({ 
        success: true, 
        message: 'Test started', 
        attempt_id: 'ATTEMPT-MOCK-001',
        questions: MOCK_QUESTIONS,
        duration_minutes: 45,
        start_time: new Date().toISOString()
      });
    }, 1000));
  }

  const submitAnswer = async (attemptId: string, questionId: string, answer: AnswerOption): Promise<void> => {
    console.log(`Submitting answer for attempt ${attemptId}, Q:${questionId}`, answer);
    // No loading state change for individual answers to keep UI responsive
    return Promise.resolve();
  };

  const completeTest = async (attemptId: string): Promise<CompleteTestResponse> => {
    setLoading(true);
    console.log('Completing test:', attemptId);
    return new Promise(resolve => setTimeout(() => {
      setLoading(false);
      resolve({ 
        success: true, 
        message: 'Test completed successfully', 
        result: {
            score: 85,
            status: 'Pass',
            correct_answers: 25,
            total_questions: 30
        }
      });
    }, 1500));
  };

  const getTestResult = async (attemptId: string): Promise<TestResultResponse> => {
    setLoading(true);
    console.log('Getting result for:', attemptId);
    return new Promise(resolve => setTimeout(() => {
      setLoading(false);
      resolve({ 
        success: true, 
        result: {
            attempt_id: attemptId,
            score: 85,
            status: 'Pass',
            correct_answers: 25,
            total_questions: 30,
            pass_mark: 70,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            answers: []
        }
      });
    }, 500));
  }

  // ... other mock methods

  const reset = () => {
    setLoading(false);
    setError(null);
  };

  return {
    loading,
    error,
    useCategoriesList,
    getCategoryDetails,
    createPayment,
    getPaymentStatus,
    startTest,
    submitAnswer,
    completeTest,
    getTestResult,
    // Mock admin/other functions as needed
    getQuestions: async () => MOCK_QUESTIONS,
    createQuestion: async (data: any) => 'Q-MOCK-NEW',
    updateQuestion: async (id: string, data: any) => {},
    deleteQuestion: async (id: string) => {},
    verifyPayment: async (id: string, status: string) => {},
    getPendingPayments: async () => [],
    generateCertificate: async (attemptId: string) => 'CERT-MOCK-001',
    getCertificate: async (certId: string) => ({ success: true, certificate_id: certId, url: '/mock.pdf' }),
    downloadCertificate: async (certId: string) => { console.log('Downloading', certId) },
    revokeCertificate: async (certId: string) => {},
    reset,
  };
};
