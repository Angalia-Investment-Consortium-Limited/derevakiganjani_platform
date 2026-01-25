import { useFrappeGetDocList, useFrappeGetDoc, useFrappeCreateDoc, useFrappeUpdateDoc } from 'frappe-react-sdk';
import type { Filter } from 'frappe-react-sdk';
import type { 
  Course, 
  Lesson, 
  CourseEnrollment, 
  LessonProgress,
  CourseFilters,
  EnrollmentRequest,
  LessonProgressUpdate
} from '@/types/elimika';

/**
 * Custom hook for Elimika (Learning Management) functionality
 */
export const useElimika = () => {
  
  /**
   * Fetch all published courses with optional filters
   */
  const useCourses = (filters?: CourseFilters) => {
    const frappeFilters: Filter[] = [
      ['status', '=', 'Published'],
      ['is_active', '=', 1]
    ];

    if (filters?.level) {
      frappeFilters.push(['level', '=', filters.level]);
    }

    if (filters?.course_track) {
      frappeFilters.push(['course_track', '=', filters.course_track]);
    }

    if (filters?.course_category) {
      frappeFilters.push(['course_category', '=', filters.course_category]);
    }

    if (filters?.search) {
      // Search in both English and Swahili names
      frappeFilters.push([
        ['course_name_en', 'like', `%${filters.search}%`],
        ['course_name_sw', 'like', `%${filters.search}%`]
      ] as any);
    }

    return useFrappeGetDocList<Course>('Course', {
      fields: [
        'name',
        'course_name_en',
        'course_name_sw',
        'description_en',
        'description_sw',
        'course_track',
        'course_category',
        'level',
        'duration_hours',
        'total_lessons',
        'thumbnail',
        'thumbnail_emoji',
        'status',
        'is_active',
        'price',
        'is_free',
        'published_date'
      ],
      filters: frappeFilters,
      orderBy: {
        field: 'published_date',
        order: 'desc'
      }
    });
  };

  /**
   * Fetch a single course by ID
   */
  const useCourse = (courseId: string | undefined) => {
    return useFrappeGetDoc<Course>('Course', courseId);
  };

  /**
   * Fetch lessons for a specific course
   */
  const useLessons = (courseId: string | undefined) => {
    const filters: Filter[] = [
      ['course', '=', courseId || ''],
      ['is_active', '=', 1]
    ];

    return useFrappeGetDocList<Lesson>('Lesson', {
      fields: [
        'name',
        'lesson_title_en',
        'lesson_title_sw',
        'course',
        'lesson_order',
        'content_type',
        'duration_minutes',
        'summary_en',
        'summary_sw',
        'is_locked',
        'unlock_after_lesson'
      ],
      filters,
      orderBy: {
        field: 'lesson_order',
        order: 'asc'
      }
    }, courseId ? undefined : null); // Don't fetch if no courseId
  };

  /**
   * Fetch a single lesson by ID
   */
  const useLesson = (lessonId: string | undefined) => {
    return useFrappeGetDoc<Lesson>('Lesson', lessonId);
  };

  /**
   * Fetch user's course enrollments
   */
  const useEnrollments = (driverProfileId: string | undefined) => {
    const filters: Filter[] = [
      ['driver', '=', driverProfileId || '']
    ];

    return useFrappeGetDocList<CourseEnrollment>('Course Enrollment', {
      fields: [
        'name',
        'driver',
        'course',
        'enrollment_date',
        'status',
        'progress_percentage',
        'completed_lessons',
        'total_lessons',
        'completion_date',
        'certificate_issued',
        'last_accessed'
      ],
      filters,
      orderBy: {
        field: 'enrollment_date',
        order: 'desc'
      }
    }, driverProfileId ? undefined : null);
  };

  /**
   * Check if user is enrolled in a specific course
   */
  const useEnrollmentStatus = (courseId: string | undefined, driverProfileId: string | undefined) => {
    const filters: Filter[] = [
      ['course', '=', courseId || ''],
      ['driver', '=', driverProfileId || '']
    ];

    return useFrappeGetDocList<CourseEnrollment>('Course Enrollment', {
      fields: [
        'name',
        'status',
        'progress_percentage',
        'completed_lessons',
        'enrollment_date'
      ],
      filters,
      limit: 1
    }, (courseId && driverProfileId) ? undefined : null);
  };

  /**
   * Fetch lesson progress for a user
   */
  const useLessonProgress = (driverProfileId: string | undefined, enrollmentId?: string) => {
    const filters: Filter[] = [
      ['driver', '=', driverProfileId || '']
    ];

    if (enrollmentId) {
      filters.push(['enrollment', '=', enrollmentId]);
    }

    return useFrappeGetDocList<LessonProgress>('Lesson Progress', {
      fields: [
        'name',
        'lesson',
        'driver',
        'enrollment',
        'status',
        'started_at',
        'completed_at',
        'time_spent_minutes'
      ],
      filters
    }, driverProfileId ? undefined : null);
  };

  /**
   * Enroll in a course
   */
  const enrollInCourse = () => {
    const { createDoc, loading, error } = useFrappeCreateDoc<CourseEnrollment>();

    const enroll = async (data: EnrollmentRequest) => {
      return await createDoc('Course Enrollment', {
        driver: data.driver,
        course: data.course,
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'Enrolled',
        progress_percentage: 0,
        completed_lessons: 0,
        certificate_issued: 0
      } as any);
    };

    return { enroll, loading, error };
  };

  /**
   * Update lesson progress
   */
  const updateLessonProgress = () => {
    const { createDoc, loading, error } = useFrappeCreateDoc<LessonProgress>();

    const updateProgress = async (data: LessonProgressUpdate) => {
      return await createDoc('Lesson Progress', {
        lesson: data.lesson,
        driver: data.driver,
        enrollment: data.enrollment,
        status: data.status,
        started_at: data.status === 'In Progress' ? new Date().toISOString() : undefined,
        completed_at: data.status === 'Completed' ? new Date().toISOString() : undefined
      } as any);
    };

    return { updateProgress, loading, error };
  };

  /**
   * Update enrollment progress
   */
  const updateEnrollmentProgress = () => {
    const { updateDoc, loading, error } = useFrappeUpdateDoc<CourseEnrollment>();

    const updateProgress = async (enrollmentId: string, data: Partial<CourseEnrollment>) => {
      return await updateDoc('Course Enrollment', enrollmentId, data);
    };

    return { updateProgress, loading, error };
  };

  return {
    useCourses,
    useCourse,
    useLessons,
    useLesson,
    useEnrollments,
    useEnrollmentStatus,
    useLessonProgress,
    enrollInCourse,
    updateLessonProgress,
    updateEnrollmentProgress
  };
};

export default useElimika;
