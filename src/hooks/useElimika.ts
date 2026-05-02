import { db } from '@/lib/firebase';
import { useState } from 'react';
import type {
  Course,
  CourseFilters,
  CourseEnrollment,
  Lesson,
  LessonProgress,
  EnrollmentRequest,
  ElimikaDriverProfile,
  Quiz
} from '@/types/elimika';
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  Query,
  serverTimestamp,
  DocumentReference,
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import useSWR, { useSWRConfig } from 'swr';
import { getAuth, type User } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";

// Define collections
const coursesCollection = collection(db, 'courses');
const lessonsCollection = collection(db, 'lessons');
const enrollmentsCollection = collection(db, 'course_enrollments');
const lessonProgressCollection = collection(db, 'lesson_progresses');
const driverProfilesCollection = collection(db, 'driver_profiles');
const quizzesCollection = collection(db, 'quizzes');

const fetcher = async (query: Query<DocumentData>) => {
  const querySnapshot = await getDocs(query);
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), name: doc.id }));
};

const docFetcher = async (docRef: DocumentReference<DocumentData>) => {
    if (!docRef) return null;
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { ...docSnap.data(), name: docSnap.id } : null;
}

export const useElimika = () => {
  const { mutate } = useSWRConfig();

  const useCourses = (filters?: CourseFilters) => {
    let q = query(
      coursesCollection,
      where('status', '==', 'Published')
      // where('is_active', '==', 1)
    );

    if (filters?.level) {
      q = query(q, where('level', '==', filters.level));
    }

    // q = query(q, orderBy('course_name_en', 'desc'));

    const { data, error } = useSWR(q, fetcher);

    return {
      data: data as Course[] | undefined,
      isLoading: !error && !data,
      isError: error,
    };
  };

  const useCourse = (courseId: string | undefined) => {
    const docRef = courseId ? doc(db, 'courses', courseId) : null;
    const { data, error } = useSWR(docRef, docFetcher);
    
    return {
      data: data as Course | undefined,
      isLoading: !error && !data && !!courseId,
      isError: error,
    };
  };

  const useLessons = (courseId: string | undefined) => {
    const q = courseId
      ? query(
          lessonsCollection,
          where('course', '==', courseId)
        )
      : null;

    const { data, error } = useSWR(q, fetcher);

    return {
      data: data as Lesson[] | undefined,
      isLoading: !error && !data && !!courseId,
      isError: error,
    };
  };

  const useLesson = (lessonId: string | undefined) => {
    const docRef = lessonId ? doc(db, 'lessons', lessonId) : null;
    const { data, error } = useSWR(docRef, docFetcher);

    return {
      data: data as Lesson | undefined,
      isLoading: !error && !data && !!lessonId,
      isError: error,
    };
  };

  const useDriverProfileByUser = (user: User | null | undefined) => {
    const q = user?.uid
        ? query(driverProfilesCollection, where("user", "==", user.uid), limit(1))
        : null;

    const { data, error } = useSWR(q, fetcher);

    return {
        data: data as ElimikaDriverProfile[] | undefined,
        isLoading: !error && !data && !!user,
        error: error,
    };
  }

  const useDriverEnrollments = (driverProfileId: string | undefined) => {
    const q = driverProfileId
        ? query(enrollmentsCollection, where('driver', '==', driverProfileId), orderBy('last_accessed', 'desc'))
        : null;

    const { data, error } = useSWR(q, fetcher);

    return {
        data: data as CourseEnrollment[] | undefined,
        isLoading: !error && !data && !!driverProfileId,
        isError: error,
    };
  };

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
  
  const useEnrollInCourse = () => {
    const [loading, setLoading] = useState(false);
    
    const enroll = async (data: EnrollmentRequest) => {
        setLoading(true);
        try {
            const enrollmentData = {
              ...data,
              enrollment_date: serverTimestamp(),
              status: 'In Progress',
              progress_percentage: 0,
              completed_lessons: 0,
              certificate_issued: null,
              last_accessed: serverTimestamp(),
            };
            const docRef = await addDoc(enrollmentsCollection, enrollmentData);
            
            // Manually update the SWR cache for enrollment status
            mutate(['enrollment', data.course, data.driver], { ...enrollmentData, name: docRef.id }, false);
            
            return docRef;
        } catch(e) {
            console.error(e);
            throw e; 
        } finally {
            setLoading(false);
        }
    };
    
    return { enroll, loading };
  };

  const useUpdateLessonProgress = () => {
    const [loading, setLoading] = useState(false);

    const markAsComplete = async (
      driverProfileId: string,
      enrollmentId: string,
      courseId: string,
      lessonId: string,
      totalLessons: number,
      currentCompletedCount: number
    ) => {
      setLoading(true);
      try {
        // 1. Create or update lesson_progresses document
        const progressId = `${enrollmentId}_${lessonId}`;
        const lessonProgressRef = doc(db, 'lesson_progresses', progressId);
        
        // Check if already completed to avoid double counting
        const currentProgress = await getDoc(lessonProgressRef);
        if (currentProgress.exists() && currentProgress.data().status === 'completed') {
           return;
        }

        await setDoc(lessonProgressRef, {
          driver: driverProfileId,
          enrollment: enrollmentId,
          lesson_id: lessonId,
          status: 'completed',
          completed_at: serverTimestamp(),
        }, { merge: true });

        // 2. Update the main enrollment document
        const enrollmentRef = doc(db, 'course_enrollments', enrollmentId);
        const newCompletedCount = currentCompletedCount + 1;
        const newPercentage = Math.round((newCompletedCount / totalLessons) * 100);

        await updateDoc(enrollmentRef, {
          completed_lessons: newCompletedCount,
          progress_percentage: newPercentage,
          last_accessed: serverTimestamp(),
          status: newPercentage === 100 ? 'Completed' : 'In Progress',
          completion_date: newPercentage === 100 ? serverTimestamp() : null
        });

        // 3. Mutate caches
        mutate(['enrollment', courseId, driverProfileId]);
        mutate(query(lessonProgressCollection, 
            where('driver', '==', driverProfileId),
            where('enrollment', '==', enrollmentId)));

      } catch (e) {
        console.error("Failed to update lesson progress:", e);
        throw e;
      } finally {
        setLoading(false);
      }
    };

    return { markAsComplete, loading };
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

    const { data, error, mutate } = useSWR(q, fetcher);

    return {
      data: data as LessonProgress[] | undefined,
      isLoading: !error && !data && !!q,
      isError: error,
      mutate,
    };
  };

  const useQuiz = (courseId: string | undefined) => {
    const docRef = courseId ? doc(db, 'quizzes', courseId) : null;
    const { data, error } = useSWR(docRef, docFetcher);
    return {
      data: data as Quiz | undefined,
      isLoading: !error && !data && !!courseId,
      isError: error,
    };
  };

  const useSaveQuiz = () => {
    const [loading, setLoading] = useState(false);
    const { mutate } = useSWRConfig();

    const saveQuiz = async (quizData: Quiz) => {
      setLoading(true);
      try {
        const courseId = quizData.course_id;
        const docRef = doc(db, 'quizzes', courseId);
        const dataToSave = {
          ...quizData,
          updated_at: serverTimestamp(),
          created_at: quizData.created_at || serverTimestamp(),
        };
        await setDoc(docRef, dataToSave, { merge: true });
        mutate(docRef);
      } catch (e) {
        console.error("Failed to save quiz:", e);
        throw e;
      } finally {
        setLoading(false);
      }
    };

    return { saveQuiz, loading };
  };

  const useCoursePayment = () => {
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth();
    const proxyUrl = import.meta.env.VITE_PAYMENT_PROXY_URL || 'https://elimika-payment-proxy-service-something.a.run.app';

    const initiatePayment = async (courseId: string, driverId: string, amount: number, email: string, phone: string) => {
      setLoading(true);
      try {
        const orderId = `ELIM-${Date.now()}`;
        
        // 1. Create payment record in Firestore
        const paymentData = {
          userId: currentUser?.uid,
          driverId,
          courseId,
          amount,
          currency: 'TZS',
          status: 'Pending',
          selcomOrderId: orderId,
          type: 'elimika_course',
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        };
        
        const paymentRef = await addDoc(collection(db, 'payments'), paymentData);

        // 2. Call Cloud Run Proxy to create Selcom order
        const response = await fetch(`${proxyUrl}/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            order_id: orderId,
            customer_email: email,
            customer_phone: phone,
          }),
        });

        if (!response.ok) {
           throw new Error('Failed to initiate payment with Selcom');
        }

        const result = await response.json();
        
        // Return the checkout URL from Selcom
        return {
           paymentId: paymentRef.id,
           checkoutUrl: result.data?.[0]?.checkout_url || result.checkout_url
        };

      } catch (e) {
        console.error("Payment initiation failed:", e);
        throw e;
      } finally {
        setLoading(false);
      }
    };

    return { initiatePayment, loading };
  };

  const useAdminEnrollments = () => {
    const { data, error, mutate } = useSWR('admin_all_enrollments', async () => {
      const snapshot = await getDocs(query(enrollmentsCollection, orderBy('enrollment_date', 'desc')));
      
      const enrollmentsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        name: doc.id
      })) as CourseEnrollment[];

      // Collect unique IDs
      const driverIds = [...new Set(enrollmentsData.map(e => e.driver))];
      const courseIds = [...new Set(enrollmentsData.map(e => e.course))];

      // Fetch related data in parallel
      const [usersSnap, coursesSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(coursesCollection)
      ]);

      const usersMap = new Map();
      usersSnap.docs.forEach(doc => {
        usersMap.set(doc.id, doc.data());
      });

      const coursesMap = new Map();
      coursesSnap.docs.forEach(doc => {
        coursesMap.set(doc.id, doc.data() as Course);
      });

      // Join data
      const joinedData = enrollmentsData.map(enrollment => {
        const user = usersMap.get(enrollment.driver);
        const course = coursesMap.get(enrollment.course);
        
        return {
          ...enrollment,
          learnerName: user?.full_name || user?.displayName || 'Unknown Learner',
          courseName: course?.course_name_en || 'Unknown Course',
          totalLessons: course?.total_lessons || course?.lessons?.length || 0,
        };
      });

      return joinedData;
    });

    return {
      data,
      isLoading: !error && !data,
      isError: error,
      mutate
    };
  };

  return {
    useCourses,
    useCourse,
    useLessons,
    useLesson,
    useDriverProfileByUser,
    useEnrollmentStatus,
    useDriverEnrollments,
    useEnrollInCourse,
    useLessonProgress,
    useUpdateLessonProgress,
    useQuiz,
    useSaveQuiz,
    useCoursePayment,
    useAdminEnrollments,
  };
};