import { Timestamp } from 'firebase/firestore';

export interface Employer {
  id: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  contactPerson: string;
  email: string;
  userId: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments: Array<{
    documentType: string;
    fileUrl: string;
    fileName: string;
  }>;
  createdAt: Timestamp;
  remarks?: string; // Remarks from the admin during review
}
