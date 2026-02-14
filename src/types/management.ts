import { Timestamp } from 'firebase/firestore';

export type UserRole = 'Driver' | 'Employer' | 'Admin' | 'Staff' | 'SuperAdmin';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  user_type?: UserRole;
  enabled: boolean;
  created_on?: string;
  last_login?: string;
  user_image?: string;
}

export interface LicenseApplication {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    applicationType: 'New' | 'Renewal' | 'Endorsement';
    categories: string[];
    district: string;
    submittedOn: Timestamp;
    status: 'Pending' | 'Approved' | 'Rejected';
    documents: { documentType: string; fileName: string; fileUrl: string }[];
    remarks?: string; // a.k.a applicantAdvice
    adminNotes?: string;
    applicantAdvice?: string;
}

export type EmployerVerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export interface EmployerProfile {
    id: string;
    company_name: string;
    company_email: string;
    company_phone: string;
    contactPerson: string;
    address: {
        street: string;
        city: string;
        country: string;
    };
    account_creation_date: Timestamp;
    verificationStatus: EmployerVerificationStatus;
    verificationDocuments: { documentType: string; fileName: string; fileUrl: string }[];
    remarks?: string;
}

export type QuestionType = 'MCQ' | 'Image' | 'Video';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type AnswerOption = 'A' | 'B' | 'C' | 'D';

export interface TestQuestion {
    name: string;
    question_text_en: string;
    question_text_sw: string;
    question_type: QuestionType;
    category: string;
    difficulty: Difficulty;
    is_active: 0 | 1;
    // Using index signatures to allow for dynamic answer option fields
    [key: `option_${string}`]: string | undefined;
    correct_answer: AnswerOption;
    image?: string;
    video_url?: string;
    explanation_en?: string;
    explanation_sw?: string;
    creation?: Timestamp;
    modified: Timestamp;
}
