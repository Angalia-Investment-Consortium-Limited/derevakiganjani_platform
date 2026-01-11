/**
 * TypeScript type definitions for Job-related DocTypes
 * Used for Ajira ya Udereva (Driver Jobs) module
 */

/**
 * Job Post DocType
 * Auto-naming: JOB-#####
 */
export interface JobPost {
  name: string;
  title: string;
  employer: string;
  status: 'Draft' | 'Published' | 'Closed';
  posted_date?: string;
  closing_date?: string;
  start_date?: string;
  
  // Job Details
  vehicle_type?: string;
  license_category?: string;
  job_type: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary';
  experience_required?: 'None' | '1-2 years' | '3-5 years' | '5+ years';
  number_of_positions?: number;
  
  // Location
  region: string;
  district: string;
  ward?: string;
  specific_location?: string;
  
  // Descriptions
  description?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  
  // Salary
  salary_range_min?: number;
  salary_range_max?: number;
  salary_period?: 'Per Hour' | 'Per Day' | 'Per Week' | 'Per Month' | 'Per Year';
  
  // Contact
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  application_method?: 'Online Application' | 'Email' | 'Phone' | 'In Person';
  
  // Statistics
  total_applications?: number;
  shortlisted_applications?: number;
  views_count?: number;
  is_featured?: number;
  
  // Metadata
  modified?: string;
  creation?: string;
  owner?: string;
}

/**
 * Job Application DocType
 * Auto-naming: JAPP-#####
 */
export interface JobApplication {
  name: string;
  job_post: string;
  job_title?: string;
  status: 'Submitted' | 'Viewed' | 'Shortlisted' | 'Interview' | 'Accepted' | 'Rejected' | 'Withdrawn';
  
  // Driver Information
  driver: string;
  driver_name?: string;
  driver_email?: string;
  driver_phone?: string;
  
  // Application Details
  application_date: string;
  cover_letter?: string;
  resume_attachment?: string;
  
  // Status Tracking
  last_update_date?: string;
  viewed_date?: string;
  shortlisted_date?: string;
  decision_date?: string;
  
  // Interview Details
  interview_date?: string;
  interview_location?: string;
  interview_notes?: string;
  
  // Employer Notes
  employer_notes?: string;
  rejection_reason?: string;
  message_to_applicant?: string;
  
  // Additional Information
  years_of_experience?: number;
  current_license_category?: string;
  expected_salary?: number;
  available_start_date?: string;
  
  // Metadata
  modified?: string;
  creation?: string;
  owner?: string;
}

/**
 * Filter interface for job search
 */
export interface JobFilter {
  vehicle_type?: string;
  license_category?: string;
  job_type?: string;
  region?: string;
  district?: string;
  salary_min?: number;
  salary_max?: number;
  search?: string;
}

/**
 * Application status type
 */
export type ApplicationStatus = 
  | 'Submitted' 
  | 'Viewed' 
  | 'Shortlisted' 
  | 'Interview' 
  | 'Accepted' 
  | 'Rejected' 
  | 'Withdrawn';

/**
 * Job application form data
 */
export interface JobApplicationFormData {
  job_post: string;
  driver: string;
  cover_letter?: string;
  resume_attachment?: string;
  years_of_experience?: number;
  expected_salary?: number;
  available_start_date?: string;
}

/**
 * Application timeline item
 */
export interface ApplicationTimelineItem {
  date: string;
  event: string;
  status: 'completed' | 'pending' | 'rejected';
}

/**
 * Job statistics
 */
export interface JobStatistics {
  total_jobs: number;
  active_jobs: number;
  total_applications: number;
  pending_applications: number;
  interview_scheduled: number;
}
