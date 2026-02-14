import type { Timestamp } from 'firebase/firestore';

export interface LicenseApplicationDocument {
  documentType: string;
  fileName: string;
  fileUrl: string;
}

export interface LicenseApplication {
  id: string;
  applicationType: string;
  district: string;
  documents: LicenseApplicationDocument[];
  email: string;
  fullName: string;
  fullNameNormalized: string;
  categories: string[];
  phoneNumber: string;
  region: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedOn: Timestamp;
  userId: string;
  remarks?: string;
  adminNotes?: string;
  applicantAdvice?: string;
}
