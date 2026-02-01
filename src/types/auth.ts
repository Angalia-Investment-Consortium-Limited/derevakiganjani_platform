export type UserRole = 'Driver' | 'Employer' | 'Admin' | 'Staff';

export interface User {
  id: string;
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
  created_on?: string;
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
  name: string;
  user: string;
  company_name: string;
  contact_person: string;
  phone_number: string;
  email?: string;
  company_registration?: string;
  address?: string;
  website?: string;
  company_logo?: string;
  verified: boolean;
  verification_status?: 'Pending' | 'Verified' | 'Rejected';
  tin_number?: string;
  business_license_number?: string;
  contact_person_position?: string;
  company_region?: string;
  company_district?: string;
}

export interface AdminProfile {
  name: string;
  user: string;
  full_name: string;
  phone_number: string;
  email?: string;
  department?: string;
  position?: string;
}

export interface AuthState {
  user: User | null;
  profile: DriverProfile | EmployerProfile | AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
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
