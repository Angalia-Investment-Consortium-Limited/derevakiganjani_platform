import { useState, useEffect } from 'react';
import type { 
  Course, 
  Lesson, 
  CourseEnrollment, 
  LessonProgress,
  CourseFilters,
  EnrollmentRequest,
  LessonProgressUpdate
} from '@/types/elimika';

// Mock Data
const MOCK_COURSES: Course[] = [
    {
        name: 'COURSE-001',
        course_name_en: 'Defensive Driving',
        course_name_sw: 'Uendeshaji wa Kujihami',
        description_en: 'Learn to drive defensively and anticipate hazards.',
        description_sw: 'Jifunze kuendesha gari kwa kujihami na kutarajia hatari.',
        course_track: 'professional',
        course_category: 'basic',
        level: 'Advanced',
        duration_hours: 10,
        total_lessons: 5,
        thumbnail: '/images/courses/defensive_driving.png',
        thumbnail_emoji: '🛡️',
        status: 'Published',
        is_active: 1,
        price: 50000,
        is_free: 0,
        published_date: '2024-01-15'
      },
];

const MOCK_LESSONS: Lesson[] = [
    {
        name: 'LESSON-001',
        lesson_title_en: 'Introduction to Defensive Driving',
        lesson_title_sw: 'Utangulizi wa Uendeshaji wa Kujihami',
        course: 'COURSE-001',
        lesson_order: 1,
        content_type: 'video',
        duration_minutes: 20,
        summary_en: 'Understanding the core principles.',
        summary_sw: 'Kuelewa kanuni za msingi.',
        is_locked: 0,
        is_active: 1
      },
];

const MOCK_ENROLLMENTS: CourseEnrollment[] = [
    {
        name: 'ENROLL-001',
        driver: 'DRIVER-001',
        course: 'COURSE-001',
        enrollment_date: '2024-07-01',
        status: 'Enrolled',
        progress_percentage: 20,
        completed_lessons: 1,
        total_lessons: 5,
        last_accessed: '2024-07-20',
        certificate_issued: 0
      }
];

const MOCK_LESSON_PROGRESS: LessonProgress[] = [
    {
        name: 'LP-001',
        lesson: 'LESSON-001',
        driver: 'DRIVER-001',
        enrollment: 'ENROLL-001',
        status: 'Completed',
        started_at: '2024-07-20T10:00:00Z',
        completed_at: '2024-07-20T10:20:00Z',
        time_spent_minutes: 20
      }
];

export const useElimika = () => {

  const useCourses = (filters?: CourseFilters) => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
      }, []);
    return { data: MOCK_COURSES, isLoading: loading, error: null };
  };

  const useCourse = (courseId: string | undefined) => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
      }, [courseId]);
    return { data: MOCK_COURSES.find(c => c.name === courseId), isLoading: loading, error: null };
  };

  const useLessons = (courseId: string | undefined) => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
      }, [courseId]);
    return { data: MOCK_LESSONS.filter(l => l.course === courseId), isLoading: loading, error: null };
  };

  const useLesson = (lessonId: string | undefined) => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
      }, [lessonId]);
    return { data: MOCK_LESSONS.find(l => l.name === lessonId), isLoading: loading, error: null };
  };

  const useDriverProfileByUser = (userEmail: string | undefined) => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
      }, [userEmail]);
    return { data: [{ name: 'DRIVER-001', user: userEmail, full_name: 'Mock Driver' }], isLoading: loading, error: null };
  };

  const useEnrollments = (driverProfileId: string | undefined) => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
      }, [driverProfileId]);
    return { data: MOCK_ENROLLMENTS, isLoading: loading, error: null };
  };

  const useEnrollmentStatus = (courseId: string | undefined, driverProfileId: string | undefined) => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
      }, [courseId, driverProfileId]);
    return { data: MOCK_ENROLLMENTS.filter(e => e.course === courseId && e.driver === driverProfileId), isLoading: loading, error: null };
  };

  const useLessonProgress = (driverProfileId: string | undefined, enrollmentId?: string) => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
      }, [driverProfileId, enrollmentId]);
    return { data: MOCK_LESSON_PROGRESS, isLoading: loading, error: null };
  };

  const enrollInCourse = () => {
    const [loading, setLoading] = useState(false);
    const enroll = async (data: EnrollmentRequest) => {
      setLoading(true);
      console.log('Enrolling in course:', data);
      return new Promise(resolve => setTimeout(() => {
        setLoading(false);
        resolve({ ...MOCK_ENROLLMENTS[0], ...data });
      }, 1000));
    };
    return { enroll, loading, error: null };
  };

  const updateLessonProgress = () => {
    const [loading, setLoading] = useState(false);
    const updateProgress = async (data: LessonProgressUpdate) => {
      setLoading(true);
      console.log('Updating lesson progress:', data);
      return new Promise(resolve => setTimeout(() => {
        setLoading(false);
        resolve({ ...MOCK_LESSON_PROGRESS[0], ...data });
      }, 1000));
    };
    return { updateProgress, loading, error: null };
  };

  const updateEnrollmentProgress = () => {
    const [loading, setLoading] = useState(false);
    const updateProgress = async (enrollmentId: string, data: Partial<CourseEnrollment>) => {
      setLoading(true);
      console.log('Updating enrollment progress:', enrollmentId, data);
      return new Promise(resolve => setTimeout(() => {
        setLoading(false);
        resolve({ ...MOCK_ENROLLMENTS[0], ...data });
      }, 1000));
    };
    return { updateProgress, loading, error: null };
  };

  return {
    useCourses,
    useCourse,
    useLessons,
    useLesson,
    useDriverProfileByUser,
    useEnrollments,
    useEnrollmentStatus,
    useLessonProgress,
    enrollInCourse,
    updateLessonProgress,
    updateEnrollmentProgress,
  };
};

export default useElimika;
