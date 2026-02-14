
import { db } from '@/lib/firebase';
import type {
  Course,
  CourseFilters,
  CourseEnrollment,
  Lesson,
  LessonProgress,
  EnrollmentRequest,
  LessonProgressUpdate,
  DriverProfile
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
  serverTimestamp,
} from 'firebase/firestore';
import type { DocumentData, User } from 'firebase/firestore';
import useSWR, { useSWRConfig } from 'swr';
import { getAuth } from "firebase/auth";

// Define collections
const coursesCollection = collection(db, 'Course');
const lessonsCollection = collection(db, 'Lesson');
const enrollmentsCollection = collection(db, 'CourseEnrollment');
const lessonProgressCollection = collection(db, 'LessonProgress');
const driverProfilesCollection = collection(db, 'Driver Profile');


const fetcher = async (query: Query<DocumentData>) => {
  const querySnapshot = await getDocs(query);
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), name: doc.id }));
};

const docFetcher = async (docRef: DocumentData) => {
    if (!docRef) return null;
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { ...docSnap.data(), name: docSnap.id } : null;
}

export const useElimika = () => {
  const { mutate } = useSWRConfig();

  const useCourses = (filters?: CourseFilters) => {
    let q = query(
      coursesCollection,
      where('status', '==', 'Published'),
      where('is_active', '==', 1)
    );

    // Apply filters if they exist
    // This part can be expanded with more complex filtering logic
    if (filters?.level) {
      q = query(q, where('level', '==', filters.level));
    }
    // Add other filters for category, track, search etc.

    q = query(q, orderBy('course_name_en', 'desc'));

    const { data, error } = useSWR(q, fetcher);

    return {
      courses: data as Course[] | undefined,
      isLoading: !error && !data,
      isError: error,
    };
  };

  const useCourse = (courseId: string | undefined) => {
    const docRef = courseId ? doc(db, 'Course', courseId) : null;
    const { data, error } = useSWR(docRef, docFetcher);
    
    return {
      course: data as Course | undefined,
      isLoading: !error && !data && !!courseId,
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
      lessons: data as Lesson[] | undefined,
      isLoading: !error && !data && !!courseId,
      isError: error,
    };
  };

  const useLesson = (lessonId: string | undefined) => {
    const docRef = lessonId ? doc(db, 'Lesson', lessonId) : null;
    const { data, error } = useSWR(docRef, docFetcher);

    return {
      lesson: data as Lesson | undefined,
      isLoading: !error && !data && !!lessonId,
      isError: error,
    };
  };

  const useDriverProfileByUser = (user: User | undefined) => {
    const q = user?.uid
        ? query(driverProfilesCollection, where("user", "==", user.uid), limit(1))
        : null;

    const { data, error } = useSWR(q, fetcher);

    return {
        data: data as DriverProfile[] | undefined,
        isLoading: !error && !data && !!user,
        error: error,
    };
  }

  const useEnrollmentStatus = (
    courseId: string | undefined,
    driverProfileId: string | undefined
  ) => {
    const key =
      courseId && driverProfileId
        ? ['enrollment', courseId, driverProfileId]
        : null;

    const { data, error, mutate } = useSWR(key, async () => {
        if (!courseId || !driverProfileId) return null;
        const q = query(
            enrollmentsCollection,
            where('course', '==', courseId),
            where('driver', '==', driverProfileId),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const docData = snapshot.docs[0].data();
        return { ...docData, name: snapshot.docs[0].id } as CourseEnrollment;
    });

    return {
      data: data,
      isLoading: !error && data === undefined && !!key,
      error: error,
      mutate: mutate
    };
  };
  
  const enrollInCourse = () => {
    const [loading, setLoading] = useState(false);
    
    const enroll = async (data: EnrollmentRequest) => {
        setLoading(true);
        try {
            const enrollmentData = {
              ...data,
              enrollment_date: serverTimestamp(),
              status: 'Enrolled',
              progress_percentage: 0,
              completed_lessons: 0,
              certificate_issued: 0,
            };
            const docRef = await addDoc(enrollmentsCollection, enrollmentData);
            
            // Manually update the SWR cache for enrollment status
            mutate(['enrollment', data.course, data.driver], { ...enrollmentData, name: docRef.id }, false);
            
            return docRef;
        } catch(e) {
            console.error(e);
            throw e; // re-throw to be caught in component
        } finally {
            setLoading(false);
        }
    };
    
    return { enroll, loading };
  };

  const useLessonProgress = (
    driverProfileId: string | undefined,
    enrollmentId?: string
  ) => {
    const q = driverProfileId && enrollmentId
      ? query(
          lessonProgressCollection, 
          where('driver', '==', driverProfileId),
          where('enrollment', '==', enrollmentId)
        )
      : null;

    const { data, error } = useSWR(q, fetcher);

    return {
      data: data as LessonProgress[] | undefined,
      isLoading: !error && !data && !!q,
      isError: error,
    };
  };

  return {
    useCourses,
    useCourse,
    useLessons,
    useLesson,
    useDriverProfileByUser,
    useEnrollmentStatus,
    enrollInCourse,
    useLessonProgress,
  };
};
