import { Timestamp } from 'firebase/firestore';

export interface Employer {
  id: string;
  company_name: string;
  address: {
    street: string;
    city: string;
    country: string;
  };
  company_phone: string;
  contactPerson: string;
  company_email: string;
  userId: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments: Array<{
    documentType: string;
    fileUrl: string;
    fileName: string;
  }>;
  account_creation_date: Timestamp;
  remarks?: string; // Remarks from the admin during review
}
