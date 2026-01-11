/**
 * TypeScript type definitions for Management DocTypes
 * Used for Course Manager, Job Post Management, and Question Bank Manager
 */

/**
 * Course DocType
 * Auto-naming: COURSE-#####
 */
export interface Course {
  name: string;
  course_name_en: string;
  course_name_sw: string;
  course_track: 'beginner' | 'professional';
  course_category: 'pikipiki' | 'basic' | 'vip' | 'psv' | 'hgv';
  level?: 'Basic' | 'Intermediate' | 'Advanced';
  description_en?: string;
  description_sw?: string;
  duration_hours?: number;
  total_lessons?: number;
  thumbnail?: string;
  thumbnail_emoji?: string;
  status: 'Draft' | 'Published' | 'Archived';
  is_active: number;
  price?: number;
  is_free: number;
  created_by?: string;
  published_date?: string;
  modified?: string;
  creation?: string;
  owner?: string;
}

/**
 * Test Question DocType
 * Auto-naming: QUEST-#####
 */
export interface TestQuestion {
  name: string;
  question_text_en: string;
  question_text_sw: string;
  category: string;
  question_type: 'MCQ' | 'Image' | 'Video';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  is_active: number;
  image?: string;
  video_url?: string;
  option_a_en: string;
  option_a_sw: string;
  option_b_en: string;
  option_b_sw: string;
  option_c_en?: string;
  option_c_sw?: string;
  option_d_en?: string;
  option_d_sw?: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation_en?: string;
  explanation_sw?: string;
  modified?: string;
  creation?: string;
  owner?: string;
}

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
  vehicle_type?: 'Car' | 'Truck' | 'Bus' | 'Motorcycle' | 'Other';
  license_category?: 'A' | 'B' | 'C' | 'D' | 'E';
  job_type: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary';
  experience_required?: 'None' | '1-2 years' | '3-5 years' | '5+ years';
  number_of_positions?: number;
  region: string;
  district: string;
  ward?: string;
  specific_location?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  salary_range_min?: number;
  salary_range_max?: number;
  salary_period?: 'Per Hour' | 'Per Day' | 'Per Week' | 'Per Month' | 'Per Year';
  benefits?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  application_method?: 'Online Application' | 'Email' | 'Phone' | 'In Person';
  total_applications?: number;
  shortlisted_applications?: number;
  views_count?: number;
  is_featured?: number;
  modified?: string;
  creation?: string;
  owner?: string;
}

/**
 * Form data interfaces for creating/editing
 */

export interface CourseFormData {
  course_name_en: string;
  course_name_sw: string;
  course_track: 'beginner' | 'professional';
  course_category: 'pikipiki' | 'basic' | 'vip' | 'psv' | 'hgv';
  level?: 'Basic' | 'Intermediate' | 'Advanced';
  description_en?: string;
  description_sw?: string;
  duration_hours?: number;
  thumbnail_emoji?: string;
  price?: number;
  is_free?: number;
}

export interface TestQuestionFormData {
  question_text_en: string;
  question_text_sw: string;
  category: string;
  question_type: 'MCQ' | 'Image' | 'Video';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  video_url?: string;
  option_a_en: string;
  option_a_sw: string;
  option_b_en: string;
  option_b_sw: string;
  option_c_en?: string;
  option_c_sw?: string;
  option_d_en?: string;
  option_d_sw?: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation_en?: string;
  explanation_sw?: string;
}

export interface JobPostFormData {
  title: string;
  employer: string;
  vehicle_type?: 'Car' | 'Truck' | 'Bus' | 'Motorcycle' | 'Other';
  license_category?: 'A' | 'B' | 'C' | 'D' | 'E';
  job_type: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary';
  experience_required?: 'None' | '1-2 years' | '3-5 years' | '5+ years';
  number_of_positions?: number;
  region: string;
  district: string;
  ward?: string;
  specific_location?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  salary_range_min?: number;
  salary_range_max?: number;
  salary_period?: 'Per Hour' | 'Per Day' | 'Per Week' | 'Per Month' | 'Per Year';
  benefits?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  closing_date?: string;
}
