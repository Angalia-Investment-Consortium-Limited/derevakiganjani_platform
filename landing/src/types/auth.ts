export type UserRole = 'Driver' | 'Employer' | 'Admin' | 'Staff';

export interface User {
  name: string;
  email: string;
  full_name: string;
  user_image?: string;
  mobile_no?: string;
  roles: UserRole[];
  user_type?: UserRole;
  enabled: boolean;
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
  experience_years?: number;
  bio?: string;
  preferred_language?: 'en' | 'sw';
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
  mobile_no: string;
  first_name: string;
  last_name?: string;
  password: string;
  user_type: UserRole;
  // Additional fields based on user type
  // For Driver
  national_id?: string;
  language?: 'en' | 'sw'; // Preferred language for emails and communications
  // For Employer
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
