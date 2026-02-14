// Elimika Module Types
import type { Timestamp } from "firebase/firestore";

export interface Course {
  name: string;
  course_name_en: string;
  course_name_sw: string;
  description_en?: string;
  description_sw?: string;
  course_track: 'beginner' | 'professional';
  course_category: 'pikipiki' | 'basic' | 'vip' | 'psv' | 'hgv';
  level?: 'Basic' | 'Intermediate' | 'Advanced';
  duration_hours?: number;
  total_lessons?: number;
  thumbnail?: string;
  thumbnail_emoji?: string;
  status: 'Draft' | 'Published' | 'Archived';
  is_active: number;
  price?: number;
  is_free: number;
  created_by?: string;
  published_date?: Timestamp;
  created?: Timestamp;
  modified?: Timestamp;
}

export interface Lesson {
  name: string;
  lesson_title_en: string;
  lesson_title_sw: string;
  course: string;
  lesson_order: number;
  content_type: 'text' | 'pdf' | 'image' | 'video';
  duration_minutes?: number;
  content_text_en?: string;
  content_text_sw?: string;
  content_file?: string;
  video_url?: string;
  video_type?: 'public' | 'private' | 'unlisted';
  summary_en?: string;
  summary_sw?: string;
  is_locked: number;
  unlock_after_lesson?: string;
  is_active: number;
  creation?: string;
  modified?: string;
}

export interface CourseEnrollment {
  name: string;
  driver: string;
  course: string;
  enrollment_date: string;
  status: 'Enrolled' | 'In Progress' | 'Completed' | 'Dropped';
  progress_percentage: number;
  completed_lessons: number;
  total_lessons?: number;
  completion_date?: string;
  certificate_issued: number;
  last_accessed?: string;
  creation?: string;
  modified?: string;
}

export interface LessonProgress {
  name: string;
  lesson: string;
  driver: string;
  enrollment?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  started_at?: string;
  completed_at?: string;
  time_spent_minutes?: number;
  creation?: string;
  modified?: string;
}

export interface CourseCertificate {
  name: string;
  driver: string;
  course: string;
  enrollment: string;
  issue_date: string;
  certificate_number: string;
  course_track?: string;
  course_category?: string;
  final_score?: number;
  certificate_file?: string;
  creation?: string;
  modified?: string;
}

// Filter types for course search
export interface CourseFilters {
  level?: 'Basic' | 'Intermediate' | 'Advanced';
  course_track?: 'beginner' | 'professional';
  course_category?: 'pikipiki' | 'basic' | 'vip' | 'psv' | 'hgv';
  search?: string;
}

// Enrollment request
export interface EnrollmentRequest {
  course: string;
  driver: string;
}

// Lesson progress update
export interface LessonProgressUpdate {
  lesson: string;
  driver: string;
  enrollment?: string;
  status: 'In Progress' | 'Completed';
}
