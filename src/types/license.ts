import { Timestamp } from "firebase/firestore";

/**
 * License Management Types
 *
 * TypeScript interfaces for License Application feature
 */

// Application Types
export type ApplicationType = 'New License' | 'License Renewal' | 'LATRA Exam';

// License Categories
export type LicenseCategory = 'A' | 'B' | 'C' | 'D' | 'E';

// LATRA Types
export type LatraType = 'PSV' | 'HGV';

// Application Status
export const ApplicationStatus = {
  Submitted: 'submitted',
  PendingPayment: 'pending_payment',
  Pending: 'pending',
  UnderReview: 'under_review',
  Approved: 'approved',
  Rejected: 'rejected',
  Completed: 'completed',
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

// Payment Status
export type PaymentStatus =
  | 'unpaid'
  | 'paid'
  | 'failed';

// Document Types
export type DocumentType =
  | 'NIDA'
  | 'Driving License'
  | 'PSV Certificate'
  | 'HGV Certificate'
  | 'Passport Photo';

// License Category Details
export interface LicenseCategoryInfo {
  code: LicenseCategory;
  name: string;
  nameSwahili: string;
  description: string;
  descriptionSwahili: string;
}

// License Application Document
export interface LicenseDocument {
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  uploadDate: string;
}

// License Application
export interface LicenseApplication {
  id: string; // Add the id property
  userId: string;
  applicationType: ApplicationType;
  fullName: string;
  fullNameNormalized: string;
  phoneNumber: string;
  email?: string;
  region: string;
  district: string;
  licenseCategory: LicenseCategory;
  latraType?: LatraType;
  currentLicenseNumber?: string;
  status: ApplicationStatus;
  paymentStatus?: PaymentStatus;
  refNo?: string;
  adminComment?: string;
  submittedOn: Timestamp;
  reviewDate?: Timestamp;
  reviewer?: string;
  remarks?: string;
  documents: LicenseDocument[];
  processedOn?: Timestamp;
}

// Application Form Data
export interface LicenseApplicationFormData {
  applicationType: ApplicationType;
  fullName: string;
  phoneNumber: string;
  email?: string;
  region: string;
  district: string;
  licenseCategory: LicenseCategory;
  latraType?: LatraType;
  currentLicenseNumber?: string;
  documents?: LicenseDocument[];
}

// Region
export interface Region {
  name: string;
  nameSwahili?: string;
}

// District
export interface District {
  name: string;
  region: string;
  nameSwahili?: string;
}

// API Response Types
export interface ApiResponse<T> {
  message: string;
  [key: string]: T | string;
}

export interface GetRegionsResponse {
  message: string;
  regions: string[];
}

export interface GetDistrictsResponse {
  message: string;
  districts: string[];
}

export interface SubmitApplicationResponse {
  success: boolean;
  message: string;
  error?: any;
  application?: {
    name: string;
    reference_number: string;
    application_type: ApplicationType;
    status: ApplicationStatus;
    submission_date: string;
  };
}

export interface GetApplicationsResponse {
  message: string;
  applications: LicenseApplication[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetApplicationStatusResponse {
  message: string;
  application: LicenseApplication;
}

export interface ApplicationStatistics {
  total: number;
  pending: number;
  under_review: number;
  approved: number;
  rejected: number;
  completed: number;
  by_type: {
    new_license: number;
    renewal: number;
    latra_exam: number;
  };
}

export interface GetStatisticsResponse {
  message: string;
  statistics: ApplicationStatistics;
}

// File Upload
export interface FileUpload {
  file: File;
  document_type: DocumentType;
  preview?: string;
}

// Application Filter
export interface ApplicationFilter {
  status?: ApplicationStatus;
  application_type?: ApplicationType;
  search?: string;
  limit?: number;
  offset?: number;
}

// Wizard Step
export interface WizardStep {
  id: number;
  title: string;
  titleSwahili: string;
  description: string;
  descriptionSwahili: string;
  isComplete: boolean;
}

// License Category Descriptions
export const LICENSE_CATEGORIES: LicenseCategoryInfo[] = [
  {
    code: 'A',
    name: 'Motorcycles',
    nameSwahili: 'Pikipiki',
    description: 'For motorcycles and motor tricycles',
    descriptionSwahili: 'Kwa pikipiki na magari ya matairi matatu'
  },
  {
    code: 'B',
    name: 'Light Vehicles',
    nameSwahili: 'Magari Mepesi',
    description: 'For light motor vehicles up to 3,500 kg',
    descriptionSwahili: 'Kwa magari mepesi hadi kilo 3,500'
  },
  {
    code: 'C',
    name: 'Heavy Vehicles',
    nameSwahili: 'Magari Mazito',
    description: 'For heavy motor vehicles over 3,500 kg',
    descriptionSwahili: 'Kwa magari mazito zaidi ya kilo 3,500'
  },
  {
    code: 'D',
    name: 'Passenger Vehicles (PSV)',
    nameSwahili: 'Magari ya Abiria (PSV)',
    description: 'For passenger service vehicles',
    descriptionSwahili: 'Kwa magari ya usafiri wa abiria'
  },
  {
    code: 'E',
    name: 'Trailer Vehicles',
    nameSwahili: 'Magari ya Trela',
    description: 'For vehicles with trailers',
    descriptionSwahili: 'Kwa magari yenye trela'
  }
];

// Application Type Descriptions
export const APPLICATION_TYPES = {
  'New License': {
    name: 'New License',
    nameSwahili: 'Leseni Mpya',
    description: 'Apply for a new driving license',
    descriptionSwahili: 'Omba leseni mpya ya udereva',
    icon: 'FileText'
  },
  'License Renewal': {
    name: 'License Renewal',
    nameSwahili: 'Kufanya Upya Leseni',
    description: 'Renew your existing driving license',
    descriptionSwahili: 'Fanya upya leseni yako ya udereva',
    icon: 'RefreshCw'
  },
  'LATRA Exam': {
    name: 'LATRA Exam Registration',
    nameSwahili: 'Jisajili Mtihani wa LATRA',
    description: 'Register for LATRA driving exam (PSV/HGV)',
    descriptionSwahili: 'Jisajili kwa mtihani wa udereva wa LATRA (PSV/HGV)',
    icon: 'ClipboardCheck'
  }
} as const;

// Status Colors
export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  'submitted': 'bg-gray-100 text-gray-800 border-gray-200',
  'pending_payment': 'bg-orange-100 text-orange-800 border-orange-200',
  'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'under_review': 'bg-blue-100 text-blue-800 border-blue-200',
  'approved': 'bg-green-100 text-green-800 border-green-200',
  'rejected': 'bg-red-100 text-red-800 border-red-200',
  'completed': 'bg-purple-100 text-purple-800 border-purple-200'
};

// Status Translations
export const STATUS_TRANSLATIONS: Record<ApplicationStatus, string> = {
  'submitted': 'Imewasilishwa',
  'pending_payment': 'Inasubiri Malipo',
  'pending': 'Inasubiri',
  'under_review': 'Inakaguliwa',
  'approved': 'Imeidhinishwa',
  'rejected': 'Imekataliwa',
  'completed': 'Imekamilika'
};

// Document Type Translations
export const DOCUMENT_TYPE_TRANSLATIONS: Record<DocumentType, string> = {
  'NIDA': 'Kitambulisho cha Taifa (NIDA)',
  'Driving License': 'Leseni ya Udereva',
  'PSV Certificate': 'Cheti cha PSV',
  'HGV Certificate': 'Cheti cha HGV',
  'Passport Photo': 'Picha ya Pasi'
};

// Required Documents by Application Type
export const REQUIRED_DOCUMENTS: Record<ApplicationType, DocumentType[]> = {
  'New License': ['NIDA', 'Passport Photo'],
  'License Renewal': ['NIDA', 'Driving License', 'Passport Photo'],
  'LATRA Exam': ['NIDA', 'Driving License', 'Passport Photo']
};

// File Upload Constraints
const generalMaxSize = 8 * 1024 * 1024; // 8 MB
const photoMaxSize = 4 * 1024 * 1024; // 4 MB
const documentTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const imageTypes = ['image/jpeg', 'image/png'];

export const FILE_UPLOAD_CONFIG = {
  allowedFileTypes: {
    'NIDA': {
        maxSize: generalMaxSize,
        allowedTypes: documentTypes
    },
    'Driving License': {
        maxSize: generalMaxSize,
        allowedTypes: documentTypes
    },
    'PSV Certificate': {
        maxSize: generalMaxSize,
        allowedTypes: documentTypes
    },
    'HGV Certificate': {
        maxSize: generalMaxSize,
        allowedTypes: documentTypes
    },
    'Passport Photo': {
        maxSize: photoMaxSize,
        allowedTypes: imageTypes
    }
  }
};
