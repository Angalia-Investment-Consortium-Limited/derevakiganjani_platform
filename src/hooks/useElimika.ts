
import { db } from '@/lib/firebase';
import type {
  Course,
  CourseFilters,
  CourseEnrollment,
  Lesson,
  LessonProgress,
  EnrollmentRequest,
  LessonProgressUpdate,
} from '@/types/elimika';
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  Query,
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import useSWR from 'swr';
import {getAuth} from "firebase/auth";

const coursesCollection = collection(db, 'courses');
const lessonsCollection = collection(db, 'lessons');
const enrollmentsCollection = collection(db, 'courseEnrollments');
const lessonProgressCollection = collection(db, 'lessonProgress');

const fetcher = async (query: Query<DocumentData>) => {
  const querySnapshot = await getDocs(query);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const useElimika = () => {
  const useCourses = (filters?: CourseFilters) => {
    let q = query(
      coursesCollection,
      where('status', '==', 'Published'),
      where('is_active', '==', 1)
    );

    if (filters?.level) {
      q = query(q, where('level', '==', filters.level));
    }
    if (filters?.course_track) {
      q = query(q, where('course_track', '==', filters.course_track));
    }
    if (filters?.course_category) {
      q = query(q, where('course_category', '==', filters.course_category));
    }
    if (filters?.search) {
      q = query(
        q,
        where('course_name_en', '>=', filters.search),
        where('course_name_en', '<=', filters.search + '\uf8ff')
      );
    }

    q = query(q, orderBy('published_date', 'desc'));

    const { data, error } = useSWR(q, fetcher);

    return {
      courses: data as unknown as Course[],
      isLoading: !error && !data,
      isError: error,
    };
  };

  const useCourse = (courseId: string | undefined) => {
    const docRef = courseId ? doc(db, 'courses', courseId) : null;
    const { data, error } = useSWR(docRef, async (ref) => {
      if (!ref) return null;
      const docSnap = await getDoc(ref);
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as unknown as Course) : null;
    });

    return {
      course: data,
      isLoading: !error && !data,
      isError: error,
    };
  };
  
    const useLessons = (courseId: string | undefined) => {
    const q = courseId
      ? query(
          lessonsCollection,
          where('course', '==', courseId),
          where('is_active', '==', 1),
          orderBy('lesson_order', 'asc')
        )
      : null;

    const { data, error } = useSWR(q, fetcher);

    return {
      lessons: data as unknown as Lesson[],
      isLoading: !error && !data && !!courseId,
      isError: error,
    };
  };

  const useLesson = (lessonId: string | undefined) => {
    const docRef = lessonId ? doc(db, 'lessons', lessonId) : null;
    const { data, error } = useSWR(docRef, async (ref) => {
      if (!ref) return null;
      const docSnap = await getDoc(ref);
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as unknown as Lesson) : null;
    });

    return {
      lesson: data,
      isLoading: !error && !data && !!lessonId,
      isError: error,
    };
  };
  
  const useEnrollments = (driverProfileId: string | undefined) => {
    const q = driverProfileId
      ? query(
          enrollmentsCollection,
          where('driver', '==', driverProfileId),
          orderBy('enrollment_date', 'desc')
        )
      : null;

    const { data, error } = useSWR(q, fetcher);

    return {
      enrollments: data as unknown as CourseEnrollment[],
      isLoading: !error && !data && !!driverProfileId,
      isError: error,
    };
  };
  
    const useEnrollmentStatus = (
    courseId: string | undefined,
    driverProfileId: string | undefined
  ) => {
    const q =
      courseId && driverProfileId
        ? query(
            enrollmentsCollection,
            where('course', '==', courseId),
            where('driver', '==', driverProfileId),
            limit(1)
          )
        : null;

    const { data, error } = useSWR(q, fetcher);

    return {
      enrollment: data?.[0] as unknown as CourseEnrollment | undefined,
      isLoading: !error && !data && !!courseId && !!driverProfileId,
      isError: error,
    };
  };
  
  const enrollInCourse = async (data: EnrollmentRequest) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('User is not authenticated.');

    const enrollmentData = {
      ...data,
      driver: user.uid,
      enrollment_date: new Date().toISOString(),
      status: 'Enrolled',
      progress_percentage: 0,
      completed_lessons: 0,
      certificate_issued: 0,
    };
    return await addDoc(enrollmentsCollection, enrollmentData);
  };
  
  const useLessonProgress = (
    driverProfileId: string | undefined,
    enrollmentId?: string
  ) => {
    let q = driverProfileId
      ? query(lessonProgressCollection, where('driver', '==', driverProfileId))
      : null;

    if (q && enrollmentId) {
      q = query(q, where('enrollment', '==', enrollmentId));
    }

    const { data, error } = useSWR(q, fetcher);

    return {
      lessonProgress: data as unknown as LessonProgress[],
      isLoading: !error && !data && !!driverProfileId,
      isError: error,
    };
  };

  const updateLessonProgress = async (data: LessonProgressUpdate) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('User is not authenticated.');

    const progressData = {
      ...data,
      driver: user.uid,
      started_at: data.status === 'In Progress' ? new Date().toISOString() : undefined,
      completed_at: data.status === 'Completed' ? new Date().toISOString() : undefined,
    };
    // Here you would typically check if a document already exists for this lesson and user
    // and either create a new one or update the existing one.
    // For simplicity, we'll just add a new document each time.
    return await addDoc(lessonProgressCollection, progressData);
  };

  const updateEnrollmentProgress = async (
    enrollmentId: string,
    data: Partial<CourseEnrollment>
  ) => {
    const enrollmentRef = doc(db, 'courseEnrollments', enrollmentId);
    return await updateDoc(enrollmentRef, data);
  };


  return {
    useCourses,
    useCourse,
    useLessons,
    useLesson,
    useEnrollments,
    useEnrollmentStatus,
    enrollInCourse,
    useLessonProgress,
    updateLessonProgress,
    updateEnrollmentProgress,
  };
};

export default useElimika;
