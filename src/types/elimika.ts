
import type { Timestamp } from 'firebase/firestore';

export interface Course {
    name: string; // Document ID
    course_name_en: string;
    course_name_sw: string;
    course_track: string;
    description_en: string;
    description_sw: string;
    duration_hours: number;
    is_active: 1 | 0;
    is_free: 1 | 0;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    modified: string; 
    price: number;
    status: 'Published' | 'Draft';
    total_lessons: number;
    // Omitted fields: total_quizzes, total_duration for brevity
  }
  
  export interface Lesson {
    name: string; // Document ID
    course_id: string;
    title_en: string;
    title_sw: string;
    content_en: string;
    content_sw: string;
    video_url?: string;
    lesson_number: number;
    created_at: Timestamp;
    updated_at: Timestamp;
  }
  
  export interface Quiz {
    name: string; // Document ID
    course_id: string;
    lesson_id: string;
    title_en: string;
    title_sw: string;
    questions: Question[];
    passing_score: number;
    created_at: Timestamp;
    updated_at: Timestamp;
  }
  
  export interface Question {
    question_id: string;
    question_text_en: string;
    question_text_sw: string;
    question_type: 'multiple-choice' | 'true-false';
    options: AnswerOption[];
    correct_answer: string | string[];
  }
  
  export interface AnswerOption {
    option_id: string;
    option_text_en: string;
    option_text_sw: string;
  }
  
  export interface CourseEnrollment {
    enrollment_id: string; // Document ID
    user_id: string;
    course_id: string;
    enrollment_date: Timestamp;
    status: 'in-progress' | 'completed';
    progress: number; // Percentage
    // Omitted: completed_lessons, completed_quizzes for brevity
  }
  
