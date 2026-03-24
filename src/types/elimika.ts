
export interface Course {
    name: string; // Document ID
    course_name_en: string;
    course_name_sw: string;
    description_en: string;
    description_sw: string;
    created_at: any; // Using `any` for Firebase Timestamp for simplicity
    updated_at: any;
    lessons: Lesson[];
    category_id: string;
    image_url?: string;
    enrollment_count: number;
    rating: number;
    author: string;
    status: 'Draft' | 'Published' | string;
    is_active: number;
    level: 'Basic' | 'Intermediate' | 'Advanced' | string;
    thumbnail_emoji?: string;
    total_lessons?: number;
    duration_hours?: number;
    is_free?: number;
    price?: number;
    modified?: any;
}

export interface CourseFilters {
  category?: string;
  sortBy?: 'rating' | 'enrollment_count' | 'created_at';
  order?: 'asc' | 'desc';
  level?: string;
  search?: string;
}

export interface CourseEnrollment {
    name: string; // document id
    course: string;
    driver: string;
    enrollment_date: any;
    status: string; // 'Enrolled'
    progress_percentage: number;
    completed_lessons: number;
    certificate_issued: number;
}

export interface EnrollmentRequest {
    course: string; // Course ID
    driver: string; // DriverProfile ID
}

export interface Lesson {
    name: string; // Document ID
    lesson_id: string;
    lesson_title_en: string;
    lesson_title_sw: string;
    summary_en?: string;
    summary_sw?: string;
    content_en?: string;
    content_sw?: string;
    video_url?: string;
    lesson_type?: 'video' | 'text';
    lesson_order: number;
    course_id?: string;
    course?: string;
    is_active: number;
    is_locked?: boolean;
    unlock_after_lesson?: string | null;
    content_type?: string;
    duration_minutes?: number;
    image_url?: string;
}

export interface Quiz {
    name: string; // Document ID, should be same as courseId
    course_id: string;
    title_en: string;
    title_sw: string;
    questions: Question[];
    passing_score: number;
    created_at?: any;
    updated_at?: any;
}

export interface Question {
    question_id: string;
    question_text_en: string;
    question_text_sw?: string;
    question_type: 'multiple-choice' | 'true-false' | 'short-answer';
    options: AnswerOption[];
    correct_answer: string; // This will be one of the option_id
}

export interface AnswerOption {
    option_id: string;
    option_text_en: string;
    option_text_sw?: string;
}

export interface UserProgress {
    progress_id: string;
    user_id: string;
    course_id: string;
    completed_lessons: string[]; // Array of lesson_ids
    quiz_attempts: QuizAttempt[];
    enrollment_date: any;
    completion_date?: any;
    last_accessed: any;
}

export interface LessonProgress {
    lesson_id: string;
    driver: string;
    enrollment: string;
    status: 'not-started' | 'in-progress' | 'completed';
    completed_at?: any;
}

export interface LessonProgressUpdate {
    status?: 'not-started' | 'in-progress' | 'completed';
    completed_at?: any;
}

export interface QuizAttempt {
    attempt_id: string;
    quiz_id: string;
    date: any;
    score: number;
    answers: UserAnswer[];
}

export interface UserAnswer {
    question_id: string;
    selected_answer: string;
    is_correct: boolean;
}

export interface Category {
    id: string;
    name_en: string;
    name_sw: string;
    description_en: string;
    description_sw: string;
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: 'student' | 'instructor' | 'admin';
    language: 'en' | 'sw';
}

export interface ElimikaDriverProfile {
    name: string; // Document ID
    user: string; // User UID
    first_name: string;
    last_name: string;
    phone_number: string;
}
