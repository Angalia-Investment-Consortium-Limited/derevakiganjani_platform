import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'SuperAdmin' | 'Admin' | 'Staff' | 'Employer' | 'Driver' | 'Tutor' | 'LicenseOfficer' | 'TestOfficer' | 'Finance';

export interface User {
  uid: string;
  email: string;
  roles: UserRole[];
  user_type?: string;
  createdAt: Timestamp;
  full_name: string;
  mobile_no: string;
  phoneNumber: string;
  enabled: boolean;
  status: string;
  notificationPreferences?: {
    smsEnabled: boolean;
    emailEnabled: boolean;
  };
  email_verified_in?: boolean;
  user_image?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  phone_number: string;
  full_name?: string;
  national_id?: string;
  preferred_language?: string;
  company_name?: string;
  contact_person?: string;
  company_registration?: string;
  address?: string;
  website?: string;
}

export interface AdminProfile {
  userId: string;
  name: string;
  email: string;
  role: 'SuperAdmin' | 'Admin' | 'Staff';
  avatar_url?: string;
}

export interface EmployerProfile {
  userId: string;
  company_email: string;
  company_phone: string;
  account_creation_date: Timestamp;
  company_name: string;
  contactPerson: string;
  position?: string;
  description?: string;
  companyRegistration: string;
  address: { street: string; city: string; country: string } | string;
  website: string;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected' | 'Suspended';
  industry: string;  remarks?: string;
  notificationPreferences?: {
    smsEnabled: boolean;
    emailEnabled: boolean;
  };
  verified?: boolean; // Legacy
  avatar_url?: string;
}

export interface DriverProfile {
  uid: string;
  email: string;
  createdAt: Timestamp;
  lastUpdated: Timestamp;
  fullName: string;
  phone_number: string;
  nationalId: string;
  preferredLanguage: string;
  bio: string;
  driverId: string;
  licenseNumber: string;
  skills: string[];
  user_image?: string;
  verified?: boolean;
  experience?: string;
  location?: string;
  preferredVehicle?: string;
  preferred_vehicle_types?: string[];
  languages?: string[];
  license_category?: string;
  license_categories?: string[];
  notificationPreferences?: {
    smsEnabled: boolean;
    emailEnabled: boolean;
  };
  avatar_url?: string;
}
