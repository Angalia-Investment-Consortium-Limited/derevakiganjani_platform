import { Timestamp } from 'firebase/firestore';

export type UserRole = 'Driver' | 'Employer' | 'Admin' | 'Staff' | 'SuperAdmin';

export interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  full_name: string;
  user_image?: string;
  mobile_no?: string;
  phone?: string;
  roles: UserRole[];
  user_type?: UserRole;
  enabled: boolean;
  status?: string;
  createdAt?: Timestamp;
}

export interface DriverProfile {
  name: string;
  user: string;
  full_name: string;
  phone_number: string;
  email?: string;
  national_id?: string;
  license_number?: string;
  license_category?: string;
  profile_photo?: string;
  date_of_birth?: string;
  address?: string;
  years_of_experience?: number;
  bio?: string;
  preferred_language?: 'en' | 'sw';
  preferred_vehicle_types?: string[];
  preferred_region?: string;
  languages?: string[];
}

export interface EmployerProfile {
    user: string;
    company_name: string;
    company_type?: string;
    company_registration?: string;
    address: string;
    contact_person: string;
    contact_phone: string;
    website?: string;
    industry?: string;
    verification_status?: 'Verified' | 'Pending' | 'Rejected';
    approved_by?: string;
    approved_on?: string;
  }
  
  export interface StaffProfile {
    user: string;
    employee_id?: string;
    department?: string;
    position?: string;
    start_date?: string;
    is_tutor?: boolean;
    is_license_officer?: boolean;
    is_test_officer?: boolean;
    is_finance?: boolean;
  }
  
  export interface AdminProfile {
    user: string;
    is_super_admin: boolean;
  }
  
  export interface LoginCredentials {
    usr: string; // email or phone
    pwd: string;
  }
  
  export interface RegisterData {
    email?: string;
    phone_number: string;
    password: string;
    role: UserRole;
    full_name?: string;
    national_id?: string;
    preferred_language?: 'en' | 'sw';
    company_name?: string;
    contact_person?: string;
    company_registration?: string;
    address?: string;
    website?: string;
  }
  
  export interface OTPVerification {
    mobile_no: string;
    otp: string;
  }
  
  export interface PasswordResetRequest {
    user: string; // email or phone
  }
  
  export interface PasswordReset {
    key: string;
    new_password: string;
  }
  
  export type ApplicationType = 'New' | 'Renewal';
  export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';
  
  export interface LicenseApplication {
      id: string;
      name: string;
      reference_number: string;
      application_type: ApplicationType;
      status: ApplicationStatus;
      submission_date: string;
  }
