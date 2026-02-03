import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import type {
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import type {
  TestCategory,
  CategoryDetails,
  TestQuestion,
  QuestionForTest,
  PaymentFormData,
  PaymentResponse,
  PaymentStatusResponse,
  StartTestResponse,
  CompleteTestResponse,
  TestResultResponse,
  CertificateResponse,
  TestResult
} from '@/types/jitesti';
import { useAuth } from '@/contexts/AuthContext';

interface UseJiTestiOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useJiTesti = (options?: UseJiTestiOptions) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: any) => {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    setError(errorMessage);
    options?.onError?.(err);
  };

  // Re-usable hook to fetch the list of test categories
  const useCategoriesList = () => {
    const [data, setData] = useState<TestCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
      if (!currentUser) return; // Don't fetch if user is not authenticated
      setIsLoading(true);
      try {
        const q = query(collection(db, 'jitesti-categories'), where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);
        const categories = querySnapshot.docs.map(doc => {
            const data = doc.data() as DocumentData;
            return {
                id: doc.id,
                name: data.name_en, // Default to English name
                name_en: data.name_en,
                name_sw: data.name_sw,
                description_en: data.description_en,
                description_sw: data.description_sw,
                duration_minutes: data.duration_minutes,
                pass_mark: data.pass_mark,
                price: data.price,
                total_questions: data.total_questions,
                status: data.status,
                license_class: data.license_class,
                category_code: data.category_code, // Add this line
                createdAt: data.createdAt,
            } as TestCategory;
        });
        setData(categories);
      } catch (err) {
        console.error("[JiTesti] Error fetching categories:", err);
        setListError(err instanceof Error ? err.message : 'Failed to fetch categories');
      }
      setIsLoading(false);
    }, [currentUser]); // Add currentUser as a dependency

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    return { data, isLoading, error: listError, mutate: fetchData };
  };


  const getCategoryDetails = async (categoryId: string): Promise<CategoryDetails | null> => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'jitesti-categories', categoryId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // The logic for fetching related questions might need adjustment if question category IDs have changed.
        const questionsQuery = query(
          collection(db, 'questions'),
          where('categoryId', '==', categoryId), 
          where('isActive', '==', true)
        );
        const questionsSnapshot = await getDocs(questionsQuery);

        return {
            id: docSnap.id,
            name: data.name_en,
            name_en: data.name_en,
            name_sw: data.name_sw,
            description_en: data.description_en,
            description_sw: data.description_sw,
            duration_minutes: data.duration_minutes,
            pass_mark: data.pass_mark,
            price: data.price,
            total_questions: data.total_questions,
            status: data.status,
            license_class: data.license_class,
            category_code: data.category_code,
            createdAt: data.createdAt,
            available_questions: questionsSnapshot.size,
        } as CategoryDetails;
      }
      return null;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (categoryId: string, userId: string): Promise<StartTestResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Test Details from the correct collection
      const testDocRef = doc(db, 'jitesti-categories', categoryId);
      const testDocSnap = await getDoc(testDocRef);
      if (!testDocSnap.exists()) throw new Error("Test category not found");
      const testData = testDocSnap.data() as TestCategory;

      // 2. Fetch Questions
      const questionsQuery = query(collection(db, 'questions'), where('categoryId', '==', categoryId), where('isActive', '==', true));
      const questionsSnapshot = await getDocs(questionsQuery);
      const questions = questionsSnapshot.docs.map(d => {
          const data = d.data() as DocumentData;
          return {
            id: d.id,
            question_text_en: data.question_text_en,
            question_text_sw: data.question_text_sw,
            question_type: data.question_type,
            image: data.image,
            video_url: data.video_url,
            option_a_en: data.option_a_en,
            option_a_sw: data.option_a_sw,
            option_b_en: data.option_b_en,
            option_b_sw: data.option_b_sw,
            option_c_en: data.option_c_en,
            option_c_sw: data.option_c_sw,
            option_d_en: data.option_d_en,
            option_d_sw: data.option_d_sw,
          } as QuestionForTest
      });

      // 3. Create Test Attempt
      const attemptRef = await addDoc(collection(db, 'test-attempts'), {
        userId,
        testId: categoryId,
        status: 'started',
        startedAt: serverTimestamp(),
        score: null,
        answers: [],
      });

      return {
        success: true,
        attempt_id: attemptRef.id,
        questions,
        duration_minutes: testData.duration_minutes,
        total_questions: questions.length, // Or use testData.total_questions
        pass_mark: testData.pass_mark,
      };

    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (attemptId: string, questionId: string, answer: string) => {
    try {
      const attemptRef = doc(db, 'test-attempts', attemptId);
       await updateDoc(attemptRef, {
        answers: arrayUnion({ questionId, answer, answeredAt: serverTimestamp() })
      });
    } catch (err) {
        // This error is not critical to the user flow, so we just log it
        console.error("Failed to submit answer:", err);
    }
  };

  const completeTest = async (attemptId: string): Promise<CompleteTestResponse | null> => {
    setLoading(true);
    setError(null);
    try {
        const attemptRef = doc(db, 'test-attempts', attemptId);
        const attemptSnap = await getDoc(attemptRef);
        if (!attemptSnap.exists()) throw new Error("Test attempt not found");

        const attemptData = attemptSnap.data();
        const questionsQuery = query(collection(db, 'questions'), where('categoryId', '==', attemptData.testId));
        const questionsSnapshot = await getDocs(questionsQuery);
        const correctAnswers = new Map(questionsSnapshot.docs.map(d => [d.id, d.data().correctAnswer]));

        let score = 0;
        let correct = 0;
        let wrong = 0;
        attemptData.answers.forEach((ans: { questionId: string; answer: string; }) => {
            if (correctAnswers.get(ans.questionId) === ans.answer) {
                score++;
                correct++;
            } else {
                wrong++;
            }
        });

        const totalQuestions = correctAnswers.size;
        const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

        const testDetails = await getCategoryDetails(attemptData.testId);
        const passed = percentage >= (testDetails?.pass_mark ?? 70);
        const completedAtDate = new Date();
        const startedAtDate = attemptData.startedAt.toDate();
        const durationInSeconds = Math.round((completedAtDate.getTime() - startedAtDate.getTime()) / 1000);

        await updateDoc(attemptRef, {
            status: 'completed',
            completedAt: completedAtDate,
            score: percentage,
            passed: passed,
        });

        let certificateId: string | undefined = undefined;
        if (passed) {
           const certResponse = await generateCertificate(attemptId, attemptData.userId, attemptData.testId, percentage);
           certificateId = certResponse?.certificate_id;
        }

        const result: TestResult = {
            attempt_id: attemptId,
            category_name_en: testDetails?.name_en ?? '',
            category_name_sw: testDetails?.name_sw ?? '',
            score_percentage: percentage,
            correct_answers: correct,
            wrong_answers: wrong,
            unanswered: totalQuestions - (correct + wrong),
            total_questions: totalQuestions,
            pass_status: passed ? 'Passed' : 'Failed',
            pass_mark: testDetails?.pass_mark ?? 70,
            duration_seconds: durationInSeconds,
            completed_on: completedAtDate.toISOString(),
            certificate_id: certificateId,
        };

        return { success: true, result };

    } catch (err) {
        handleError(err);
        return null;
    } finally {
        setLoading(false);
    }
  };

  const generateCertificate = async (attemptId: string, userId: string, testId: string, score: number): Promise<CertificateResponse | null> => {
      try {
          const certRef = await addDoc(collection(db, "certificates"), {
              attemptId,
              userId,
              testId,
              issuedAt: serverTimestamp(),
              score,
          });
          return { success: true, certificate_id: certRef.id };
      } catch(err) {
          console.error("Failed to generate certificate", err);
          // Don't block completion flow if cert generation fails
          return null;
      }
  }

  const getTestResult = async (attemptId: string): Promise<TestResultResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const attemptRef = doc(db, 'test-attempts', attemptId);
      const attemptSnap = await getDoc(attemptRef);
      if (!attemptSnap.exists() || attemptSnap.data().status !== 'completed') {
        throw new Error("Result not available or test not completed.");
      }
      const resultData = attemptSnap.data();
      return { 
        success: true,
        ...resultData
      } as TestResultResponse;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Reset function
  const reset = () => {
    setLoading(false);
    setError(null);
  };

  return {
    loading,
    error,
    useCategoriesList,
    getCategoryDetails,
    startTest,
    submitAnswer,
    completeTest,
    getTestResult,
    reset
  };
};
