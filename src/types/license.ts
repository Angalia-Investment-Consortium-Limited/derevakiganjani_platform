
import { Timestamp } from 'firebase/firestore';

// --- CONSTANTS ---

export const STATUS_COLORS: { [key: string]: string } = {
  'pending-review': 'bg-yellow-100 text-yellow-800',
  'pending-payment': 'bg-blue-100 text-blue-800',
  'approved': 'bg-green-100 text-green-800',
  'rejected': 'bg-red-100 text-red-800',
  'requires-changes': 'bg-orange-100 text-orange-800',
  'payment-failed': 'bg-red-100 text-red-800',
};

export const STATUS_TRANSLATIONS: { [key: string]: string } = {
  'pending-review': 'Inasubiri Uhakiki',
  'pending-payment': 'Inasubiri Malipo',
  'approved': 'Imeidhinishwa',
  'rejected': 'Imekataliwa',
  'requires-changes': 'Inahitaji Mabadiliko',
  'payment-failed': 'Malipo Yameshindikana',
};

export const APPLICATION_TYPES = [
  'New License',
  'License Renewal',
  'LATRA Exam'
] as const;

export const APPLICATION_FEES: { [key in ApplicationType]: number } = {
  'New License': 300,
  'License Renewal': 3000,
  'LATRA Exam': 2000,
};

export const LICENSE_CATEGORIES = [
  'A', 'A1', 'A2', 'A3',
  'B', 'B1',
  'C', 'C1', 'C2', 'C3',
  'D', 'E'
] as const;

export const DOCUMENT_TYPE_TRANSLATIONS: { [key: string]: string } = {
  nationalId: 'National ID',
  drivingLicense: 'Driving License',
  passport: 'Passport Photo',
  utilityBill: 'Utility Bill',
  psvCertificate: 'PSV Certificate',
  hgvCertificate: 'HGV Certificate',
};

// This is the source of truth for the document types
export const DOCUMENT_TYPES = [
  'nationalId',
  'drivingLicense',
  'passport',
  'utilityBill',
  'psvCertificate',
  'hgvCertificate'
] as const;

export type DocumentType = typeof DOCUMENT_TYPES[number];


export const REQUIRED_DOCUMENTS: { [key in ApplicationType]: DocumentType[] } = {
  'New License': ['nationalId', 'passport'],
  'License Renewal': ['drivingLicense'],
  'LATRA Exam': ['nationalId', 'passport', 'psvCertificate', 'hgvCertificate'],
};

// A more robust config allowing per-document validation, matching the hook's expectation.
export const FILE_UPLOAD_CONFIG: FileUploadConfig = {
  allowedFileTypes: {
    nationalId: {
      maxSize: 1024 * 1024 * 5, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    },
    drivingLicense: {
      maxSize: 1024 * 1024 * 5, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    },
    passport: {
      maxSize: 1024 * 1024 * 2, // 2MB
      allowedTypes: ['image/jpeg', 'image/png'],
    },
    utilityBill: {
      maxSize: 1024 * 1024 * 2, // 2MB
      allowedTypes: ['application/pdf', 'image/jpeg'],
    },
    psvCertificate: {
      maxSize: 1024 * 1024 * 5,
      allowedTypes: ['application/pdf'],
    },
    hgvCertificate: {
      maxSize: 1024 * 1024 * 5,
      allowedTypes: ['application/pdf'],
    }
  },
};


// --- CORE TYPES ---

export const ApplicationStatus = {
  PendingPayment: 'pending-payment',
  PaymentFailed: 'payment-failed',
  PendingReview: 'pending-review',
  RequiresChanges: 'requires-changes',
  Approved: 'approved',
  Rejected: 'rejected',
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];
export type ApplicationType = typeof APPLICATION_TYPES[number];
export type LicenseCategory = typeof LICENSE_CATEGORIES[number];
export type LatraType = 'PSV' | 'HGV';


// --- INTERFACES ---

export interface FileUploadConfig {
  allowedFileTypes: {
    // This makes sure all document types are covered in the config
    [key in DocumentType]: {
      maxSize: number;
      allowedTypes: string[];
    }
  }
}

export interface DocumentUpload {
  name: DocumentType;
  url: string;
}

export interface LicenseApplicationFormData {
  application_type: ApplicationType;
  full_name: string;
  nida_number: string;
  date_of_birth: string;
  phone_number: string;
  email: string;
  region: string;
  district: string;
  license_category: LicenseCategory[];
  current_license_number?: string;
  latra_type?: LatraType;
}

export interface SubmitApplicationResponse {
  success: boolean;
  message: string;
  applicationId?: string;
  paymentId?: string;
  error?: any;
}

// Firestore Document Structure for `license_applications`
export interface LicenseApplication {
  id: string; // Document ID
  userId: string;
  paymentId: string;
  applicationType: ApplicationType;
  status: ApplicationStatus;
  fullName: string;
  fullNameNormalized: string;
  nidaNumber: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  region: string;
  district: string;
  categories: LicenseCategory[];
  documents: DocumentUpload[];
  submittedOn: Timestamp;
  lastUpdated: Timestamp;
  adminNotes?: string;
  applicantAdvice?: string;
}

export interface LicenseRequest {
  id: string;
  userId: string;
  subject: string;
  fullName: string;
  email: string;
  status: 'submitted' | 'in-review' | 'resolved' | 'closed';
  submittedOn: Timestamp;
  lastUpdated: Timestamp;
  details?: string;
  adminNotes?: string;
}
