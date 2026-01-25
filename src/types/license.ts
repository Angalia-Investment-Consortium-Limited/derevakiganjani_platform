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
export type ApplicationStatus =
  | 'Pending Payment'
  | 'Pending'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Completed';

// Payment Status
export type PaymentStatus =
  | 'Unpaid'
  | 'Paid'
  | 'Failed';

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
  document_type: DocumentType;
  file_url: string;
  file_name: string;
  upload_date: string;
}

// License Application
export interface LicenseApplication {
  name: string; // Reference number (e.g., LIC-2025-00001)
  user: string;
  application_type: ApplicationType;
  full_name: string;
  phone_number: string;
  email?: string;
  region: string;
  district: string;
  license_category: LicenseCategory;
  latra_type?: LatraType;
  current_license_number?: string;
  status: ApplicationStatus;
  payment_status?: PaymentStatus;
  ref_no?: string;
  admin_comment?: string;
  submission_date: string;
  review_date?: string;
  reviewer?: string;
  reviewer_notes?: string;
  documents: LicenseDocument[];
}

// Application Form Data
export interface LicenseApplicationFormData {
  application_type: ApplicationType;
  full_name: string;
  phone_number: string;
  email?: string;
  region: string;
  district: string;
  license_category: LicenseCategory;
  latra_type?: LatraType;
  current_license_number?: string;
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
  message: string;
  application: {
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
  'Pending Payment': 'bg-orange-100 text-orange-800 border-orange-200',
  'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Under Review': 'bg-blue-100 text-blue-800 border-blue-200',
  'Approved': 'bg-green-100 text-green-800 border-green-200',
  'Rejected': 'bg-red-100 text-red-800 border-red-200',
  'Completed': 'bg-purple-100 text-purple-800 border-purple-200'
};

// Status Translations
export const STATUS_TRANSLATIONS: Record<ApplicationStatus, string> = {
  'Pending Payment': 'Inasubiri Malipo',
  'Pending': 'Inasubiri',
  'Under Review': 'Inakaguliwa',
  'Approved': 'Imeidhinishwa',
  'Rejected': 'Imekataliwa',
  'Completed': 'Imekamilika'
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
export const FILE_UPLOAD_CONFIG = {
  maxSize: 8 * 1024 * 1024, // 8 MB in bytes
  acceptedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  acceptedExtensions: ['.jpg', '.jpeg', '.png', '.pdf']
};
