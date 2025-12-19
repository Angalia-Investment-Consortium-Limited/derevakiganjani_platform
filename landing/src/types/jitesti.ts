/**
 * JiTesti Module TypeScript Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the JiTesti
 * (Driver Testing) module.
 */

// ============================================================================
// Test Category Types
// ============================================================================

export interface TestCategory {
  name: string;
  category_code: 'MOTO' | 'BASIC' | 'VIP' | 'PSV' | 'HGV' | 'INTERVIEW';
  name_en: string;
  name_sw: string;
  description_en: string;
  description_sw: string;
  price: number;
  pass_mark: number;
  duration_minutes: number;
  total_questions: number;
  is_active: number;
  display_order?: number;
  available_questions?: number;
}

export interface CategoryDetails extends TestCategory {
  available_questions: number;
}

// ============================================================================
// Test Question Types
// ============================================================================

export type QuestionType = 'MCQ' | 'Image' | 'Video';
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';
export type AnswerOption = 'A' | 'B' | 'C' | 'D';

export interface TestQuestion {
  name: string;
  question_text_en: string;
  question_text_sw: string;
  category: string;
  question_type: QuestionType;
  image?: string;
  video_url?: string;
  option_a_en: string;
  option_a_sw: string;
  option_b_en: string;
  option_b_sw: string;
  option_c_en?: string;
  option_c_sw?: string;
  option_d_en?: string;
  option_d_sw?: string;
  correct_answer: AnswerOption;
  explanation_en?: string;
  explanation_sw?: string;
  difficulty: QuestionDifficulty;
  is_active: number;
  created_by?: string;
  creation?: string;
}

export interface QuestionForTest {
  id: string;
  question_text_en: string;
  question_text_sw: string;
  question_type: QuestionType;
  image?: string;
  video_url?: string;
  option_a_en: string;
  option_a_sw: string;
  option_b_en: string;
  option_b_sw: string;
  option_c_en?: string;
  option_c_sw?: string;
  option_d_en?: string;
  option_d_sw?: string;
}

export interface QuestionFormData {
  question_text_en: string;
  question_text_sw: string;
  category: string;
  question_type: QuestionType;
  image?: string;
  video_url?: string;
  option_a_en: string;
  option_a_sw: string;
  option_b_en: string;
  option_b_sw: string;
  option_c_en?: string;
  option_c_sw?: string;
  option_d_en?: string;
  option_d_sw?: string;
  correct_answer: AnswerOption;
  explanation_en?: string;
  explanation_sw?: string;
  difficulty: QuestionDifficulty;
}

// ============================================================================
// Payment Types
// ============================================================================

export type PaymentMethod = 'M-Pesa' | 'Airtel Money' | 'Bank Transfer';
export type PaymentStatus = 'Pending' | 'Verified' | 'Rejected';

export interface TestPayment {
  name: string;
  driver: string;
  category: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number: string;
  payment_proof?: string;
  status: PaymentStatus;
  verified_by?: string;
  verified_on?: string;
  notes?: string;
  creation?: string;
}

export interface PaymentFormData {
  category_code: string;
  payment_method: PaymentMethod;
  reference_number: string;
  payment_proof?: File | null;
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  payment_id?: string;
  reference_number?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  payment?: {
    name: string;
    status: PaymentStatus;
    amount: number;
    payment_method: PaymentMethod;
    reference_number: string;
    verified_on?: string;
    notes?: string;
  };
  message?: string;
}

// ============================================================================
// Test Attempt Types
// ============================================================================

export type TestStatus = 'In Progress' | 'Completed' | 'Abandoned';
export type PassStatus = 'Passed' | 'Failed';

export interface TestAttempt {
  name: string;
  driver: string;
  category: string;
  payment: string;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  score_percentage: number;
  pass_status?: PassStatus;
  answers_json: string;
  status: TestStatus;
}

export interface TestAttemptData {
  attempt_id: string;
  duration_minutes: number;
  total_questions: number;
  pass_mark: number;
  questions: QuestionForTest[];
}

export interface QuestionAnswer {
  question_id: string;
  answer: AnswerOption;
}

export interface TestProgress {
  attempt_id: string;
  answered: number;
  unanswered: number;
  total_questions: number;
  time_remaining_seconds: number;
}

// ============================================================================
// Test Result Types
// ============================================================================

export interface TestResult {
  attempt_id: string;
  category_name_en: string;
  category_name_sw: string;
  score_percentage: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  total_questions: number;
  pass_status: PassStatus;
  pass_mark: number;
  duration_seconds: number;
  completed_on: string;
  certificate_id?: string;
}

export interface TestResultResponse {
  success: boolean;
  result?: TestResult;
  message?: string;
}

// ============================================================================
// Certificate Types
// ============================================================================

export interface TestCertificate {
  name: string;
  driver: string;
  test_attempt: string;
  category: string;
  certificate_number: string;
  issue_date: string;
  expiry_date?: string;
  score_percentage: number;
  certificate_pdf?: string;
  is_valid: number;
  revoked_on?: string;
  revoked_by?: string;
  revocation_reason?: string;
}

export interface CertificateDetails {
  certificate_number: string;
  driver_name: string;
  category_name_en: string;
  category_name_sw: string;
  score_percentage: number;
  issue_date: string;
  is_valid: boolean;
}

export interface CertificateResponse {
  success: boolean;
  certificate?: CertificateDetails;
  certificate_id?: string;
  message?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface CategoriesResponse {
  success: boolean;
  categories?: TestCategory[];
  message?: string;
}

export interface CategoryDetailsResponse {
  success: boolean;
  category?: CategoryDetails;
  message?: string;
}

export interface QuestionsResponse {
  success: boolean;
  questions?: TestQuestion[];
  message?: string;
}

export interface QuestionResponse {
  success: boolean;
  question_id?: string;
  message?: string;
}

export interface StartTestResponse {
  success: boolean;
  attempt_id?: string;
  duration_minutes?: number;
  total_questions?: number;
  pass_mark?: number;
  questions?: QuestionForTest[];
  message?: string;
}

export interface SubmitAnswerResponse {
  success: boolean;
  message?: string;
}

export interface CompleteTestResponse {
  success: boolean;
  result?: TestResult;
  message?: string;
}

// ============================================================================
// Admin Types
// ============================================================================

export interface PendingPayment {
  name: string;
  driver: string;
  category: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number: string;
  payment_proof?: string;
  creation: string;
}

export interface PendingPaymentsResponse {
  success: boolean;
  payments?: PendingPayment[];
  message?: string;
}

export interface TestAttemptSummary {
  name: string;
  driver: string;
  driver_name?: string;
  category: string;
  category_name?: string;
  score_percentage: number;
  pass_status: PassStatus;
  completed_on: string;
}

export interface TestStatistics {
  total_attempts: number;
  passed: number;
  failed: number;
  pass_rate: number;
  average_score: number;
  by_category: {
    [key: string]: {
      attempts: number;
      passed: number;
      failed: number;
      pass_rate: number;
      average_score: number;
    };
  };
}

// ============================================================================
// Form State Types
// ============================================================================

export interface TestCategoryFormState {
  selectedCategory: TestCategory | null;
  loading: boolean;
  error: string | null;
}

export interface PaymentFormState {
  payment_method: PaymentMethod | '';
  reference_number: string;
  payment_proof: File | null;
  loading: boolean;
  error: string | null;
}

export interface TestFormState {
  currentQuestionIndex: number;
  answers: { [questionId: string]: AnswerOption };
  timeRemaining: number;
  loading: boolean;
  error: string | null;
}

export interface QuestionFormState extends QuestionFormData {
  loading: boolean;
  error: string | null;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface QuestionFilters {
  category?: string;
  question_type?: QuestionType;
  difficulty?: QuestionDifficulty;
  search?: string;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  category?: string;
  payment_method?: PaymentMethod;
  date_from?: string;
  date_to?: string;
}

export interface AttemptFilters {
  category?: string;
  pass_status?: PassStatus;
  driver?: string;
  date_from?: string;
  date_to?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type CategoryCode = 'MOTO' | 'BASIC' | 'VIP' | 'PSV' | 'HGV' | 'INTERVIEW';

export const CATEGORY_CODES: CategoryCode[] = ['MOTO', 'BASIC', 'VIP', 'PSV', 'HGV', 'INTERVIEW'];

export const CATEGORY_NAMES: Record<CategoryCode, { en: string; sw: string }> = {
  MOTO: {
    en: 'Motorcycle/Bajaji Driver',
    sw: 'Dereva wa Pikipiki/Bajaji'
  },
  BASIC: {
    en: 'Basic Driving',
    sw: 'Dereva wa Awali'
  },
  VIP: {
    en: 'VIP Driver',
    sw: 'Dereva Mahiri – Magari ya Viongozi'
  },
  PSV: {
    en: 'PSV Driver',
    sw: 'Dereva Mahiri – Magari ya Abiria'
  },
  HGV: {
    en: 'HGV Driver',
    sw: 'Dereva Mahiri – Magari ya Mizigo'
  },
  INTERVIEW: {
    en: 'Pre-Interview Test',
    sw: 'Kujiandaa na Usaili'
  }
};

export const PAYMENT_METHODS: PaymentMethod[] = ['M-Pesa', 'Airtel Money', 'Bank Transfer'];

export const QUESTION_TYPES: QuestionType[] = ['MCQ', 'Image', 'Video'];

export const DIFFICULTY_LEVELS: QuestionDifficulty[] = ['Easy', 'Medium', 'Hard'];

export const ANSWER_OPTIONS: AnswerOption[] = ['A', 'B', 'C', 'D'];
