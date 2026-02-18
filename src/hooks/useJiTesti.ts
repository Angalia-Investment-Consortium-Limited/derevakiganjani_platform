
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
  documentId,
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
        // 1. Fetch Category Details from `jitesti-categories`
        const categoryDocRef = doc(db, 'jitesti-categories', categoryId);
        const categoryDocSnap = await getDoc(categoryDocRef);
        if (!categoryDocSnap.exists()) throw new Error("Test category not found.");
        const categoryData = categoryDocSnap.data() as TestCategory;

        if (!categoryData.category_code) {
            throw new Error("Category is missing 'category_code', cannot start test.");
        }

        // 2. Find the corresponding test in the 'tests' collection
        const testsRef = collection(db, 'tests');
        const testQuery = query(testsRef, where('courseId', '==', categoryData.category_code));
        const testQuerySnapshot = await getDocs(testQuery);
        if (testQuerySnapshot.empty) {
            throw new Error(`No active test found for category code: ${categoryData.category_code}`);
        }
        const testDoc = testQuerySnapshot.docs[0];
        const testData = testDoc.data();
        const questionIds = testData.questionIds || [];

        // 3. Create Test Attempt
        const attemptRef = await addDoc(collection(db, 'test-attempts'), {
            userId: userId,
            categoryId: categoryData.category_code, // Use the linking code
            categoryTitle: categoryData.name_en,
            startTime: serverTimestamp(),
            durationInMinutes: categoryData.duration_minutes,
            passMark: categoryData.pass_mark,
            status: 'started',
            answers: {},
        });

        // 4. (Optional but good for response) Fetch question details
        let questions: QuestionForTest[] = [];
        if (questionIds.length > 0) {
            const questionsRef = collection(db, 'Test Question');
            const q = query(questionsRef, where(documentId(), 'in', questionIds));
            const questionsSnapshot = await getDocs(q);
            questions = questionsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuestionForTest));
        }

        return {
            success: true,
            attempt_id: attemptRef.id,
            questions,
            duration_minutes: categoryData.duration_minutes,
            total_questions: questions.length,
            pass_mark: categoryData.pass_mark,
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
        [`answers.${questionId}`]: answer // More robust update
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
        
        // Find the test to get the questionIds
        const testsRef = collection(db, 'tests');
        const testQuery = query(testsRef, where('courseId', '==', attemptData.categoryId));
        const testQuerySnapshot = await getDocs(testQuery);
        if (testQuerySnapshot.empty) throw new Error("Could not find test to score against.");
        const testDoc = testQuerySnapshot.docs[0];
        const questionIds = testDoc.data().questionIds || [];

        // Fetch the correct answers for those questions
        const questionsRef = collection(db, 'Test Question');
        const questionsQuery = query(questionsRef, where(documentId(), 'in', questionIds));
        const questionsSnapshot = await getDocs(questionsQuery);
        const correctAnswers = new Map(questionsSnapshot.docs.map(d => [d.id, d.data().correctAnswerIndex ?? d.data().correctAnswer])); // Handle both index and key

        let score = 0;
        let correct = 0;
        let wrong = 0;
        const userAnswers = attemptData.answers || {};

        questionIds.forEach((questionId: string) => {
            const correctAnswer = correctAnswers.get(questionId);
            const userAnswer = userAnswers[questionId];

            if (userAnswer === correctAnswer) { // This needs to be smarter based on type
                score++;
                correct++;
            } else if (typeof userAnswer !== 'undefined') {
                wrong++;
            }
        });


        const totalQuestions = questionIds.length;
        const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

        const passed = percentage >= (attemptData.passMark ?? 70);
        const completedAtDate = new Date();
        const startedAtDate = attemptData.startTime.toDate();
        const durationInSeconds = Math.round((completedAtDate.getTime() - startedAtDate.getTime()) / 1000);

        await updateDoc(attemptRef, {
            status: 'completed',
            endTime: completedAtDate,
            score: score,
            passed: passed,
        });

        let certificateId: string | undefined = undefined;
        if (passed) {
           const certResponse = await generateCertificate(attemptId, attemptData.userId, attemptData.categoryId, percentage);
           certificateId = certResponse?.certificate_id;
        }

        const result: TestResult = {
            attempt_id: attemptId,
            category_name_en: attemptData.categoryTitle ?? '',
            category_name_sw: '', // Need to fetch this if required
            score_percentage: percentage,
            correct_answers: correct,
            wrong_answers: wrong,
            unanswered: totalQuestions - (correct + wrong),
            total_questions: totalQuestions,
            pass_status: passed ? 'Passed' : 'Failed',
            pass_mark: attemptData.passMark ?? 70,
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
              testId, // testId here is actually a categoryId/courseId
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
       // Reconstruct parts of the TestResult if they are not stored on the attempt document
      const result: TestResult = {
        attempt_id: attemptId,
        category_name_en: resultData.categoryTitle,
        category_name_sw: '',
        score_percentage: resultData.score ? (resultData.score / resultData.total_questions) * 100 : 0,
        correct_answers: resultData.score,
        wrong_answers: resultData.total_questions - resultData.score,
        unanswered: 0, // This is tricky to calculate after the fact
        total_questions: resultData.total_questions,
        pass_status: resultData.passed ? 'Passed' : 'Failed',
        pass_mark: resultData.passMark,
        duration_seconds: resultData.endTime && resultData.startTime ? (resultData.endTime.toMillis() - resultData.startTime.toMillis()) / 1000 : 0,
        completed_on: resultData.endTime?.toDate().toISOString(),
        certificate_id: resultData.certificate_id,
      };

      return { 
        success: true,
        result: result
      };
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
