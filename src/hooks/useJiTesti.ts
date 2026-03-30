
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
  documentId,
} from 'firebase/firestore';
import type {
  DocumentData,
} from 'firebase/firestore';
import type {
  TestCategory,
  CategoryDetails,
  QuestionForTest,
  StartTestResponse,
  CompleteTestResponse,
  TestResultResponse,
  TestResult,
  CertificateResponse
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

  const useCategoriesList = () => {
    const [data, setData] = useState<TestCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const q = query(collection(db, 'jitesti-categories'), where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);
        const categories = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as TestCategory));
        setData(categories);
      } catch (err) {
        console.error("[JiTesti] Error fetching categories:", err);
        setListError(err instanceof Error ? err.message : 'Failed to fetch categories');
      }
      setIsLoading(false);
    }, [currentUser]);

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
        const questionsQuery = query(
          collection(db, 'questions'),
          where('categoryId', '==', categoryId), 
          where('isActive', '==', true)
        );
        const questionsSnapshot = await getDocs(questionsQuery);

        return {
            ...data,
            id: docSnap.id,
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
        const categoryDocRef = doc(db, 'jitesti-categories', categoryId);
        const categoryDocSnap = await getDoc(categoryDocRef);
        if (!categoryDocSnap.exists()) throw new Error("Test category not found.");
        const categoryData = categoryDocSnap.data() as TestCategory;

        if (!categoryData.category_code) {
            throw new Error("Category is missing 'category_code', cannot start test.");
        }

        const testsRef = collection(db, 'tests');
        const testQuery = query(testsRef, where('courseId', '==', categoryData.category_code));
        const testQuerySnapshot = await getDocs(testQuery);
        if (testQuerySnapshot.empty) {
            throw new Error(`No active test found for category code: ${categoryData.category_code}`);
        }
        const testDoc = testQuerySnapshot.docs[0];
        const questionIds = testDoc.data().questionIds || [];

        // Corrected collection name to 'test_attempts'
        const attemptRef = await addDoc(collection(db, 'test_attempts'), {
            userId: userId,
            categoryId: categoryId, // Storing the original categoryId
            categoryTitle: categoryData.name_en,
            startTime: serverTimestamp(),
            durationInMinutes: categoryData.duration_minutes,
            passMark: categoryData.pass_mark,
            status: 'started',
            answers: {},
        });

        let questions: QuestionForTest[] = [];
        if (questionIds.length > 0) {
            // Corrected question collection name
            const questionsRef = collection(db, 'questions');
            for (let i = 0; i < questionIds.length; i += 30) {
                const chunk = questionIds.slice(i, i + 30);
                const q = query(questionsRef, where(documentId(), 'in', chunk));
                const questionsSnapshot = await getDocs(q);
                questions = questions.concat(questionsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuestionForTest)));
            }
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
      // Corrected collection name
      const attemptRef = doc(db, 'test_attempts', attemptId);
       await updateDoc(attemptRef, {
        [`answers.${questionId}`]: answer
      });
    } catch (err) {
        console.error("Failed to submit answer:", err);
    }
  };

  const completeTest = async (attemptId: string): Promise<CompleteTestResponse | null> => {
    setLoading(true);
    setError(null);
    try {
        const attemptRef = doc(db, 'test_attempts', attemptId);
        const attemptSnap = await getDoc(attemptRef);
        if (!attemptSnap.exists()) throw new Error("Test attempt not found");

        const attemptData = attemptSnap.data();

        // Fetch category to get the linking code
        const categoryRef = doc(db, 'jitesti-categories', attemptData.categoryId);
        const categorySnap = await getDoc(categoryRef);
        if (!categorySnap.exists()) throw new Error("Test category details not found.");
        const categoryCode = categorySnap.data().category_code;

        const testsRef = collection(db, 'tests');
        const testQuery = query(testsRef, where('courseId', '==', categoryCode));
        const testQuerySnapshot = await getDocs(testQuery);
        if (testQuerySnapshot.empty) throw new Error("Could not find test to score against.");
        const testDoc = testQuerySnapshot.docs[0];
        const questionIds = testDoc.data().questionIds || [];

        // Corrected question collection name
        const questionsRef = collection(db, 'questions');
        const correctAnswers = new Map<string, any>();
        
        for (let i = 0; i < questionIds.length; i += 30) {
            const chunk = questionIds.slice(i, i + 30);
            const questionsQuery = query(questionsRef, where(documentId(), 'in', chunk));
            const questionsSnapshot = await getDocs(questionsQuery);
            questionsSnapshot.docs.forEach(d => {
                correctAnswers.set(d.id, d.data().correctAnswerIndex ?? d.data().correctAnswer);
            });
        }

        let score = 0;
        let correct = 0;
        let wrong = 0;
        const userAnswers = attemptData.answers || {};

        questionIds.forEach((questionId: string) => {
            const correctAnswer = correctAnswers.get(questionId);
            const userAnswer = userAnswers[questionId];

            if (String(userAnswer) === String(correctAnswer)) {
                score++;
                correct++;
            } else if (typeof userAnswer !== 'undefined') {
                wrong++;
            }
        });

        const totalQuestions = questionIds.length;
        const percentage = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
        const passed = percentage >= (attemptData.passMark ?? 70);
        const completedAtDate = new Date();
        const startedAtDate = attemptData.startTime.toDate();
        const durationInSeconds = Math.round((completedAtDate.getTime() - startedAtDate.getTime()) / 1000);

        await updateDoc(attemptRef, {
            status: 'completed',
            endTime: completedAtDate,
            score: percentage, // Store the percentage score
            total_questions: totalQuestions, // Store total questions
            passed: passed,
        });

        let certificateId: string | undefined = undefined;
        if (passed) {
           const certResponse = await generateCertificate(attemptId, attemptData.userId, categoryCode, percentage);
           if (certResponse?.certificate_id) {
             certificateId = certResponse.certificate_id;
             await updateDoc(attemptRef, { certificate_id: certificateId });
           }
        }

        const result: TestResult = {
            attempt_id: attemptId,
            category_name_en: attemptData.categoryTitle ?? '',
            category_name_sw: '',
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

  const generateCertificate = async (attemptId: string, userId: string, course_name: string, score: number): Promise<CertificateResponse | null> => {
      try {
          const certRef = await addDoc(collection(db, "certificates"), {
              testAttemptId: attemptId,
              driverId: userId,
              course_name,
              issue_date: serverTimestamp(),
              status: 'Active',
              score,
              // certificate_url will be generated by a cloud function later
          });
          return { success: true, certificate_id: certRef.id };
      } catch(err) {
          console.error("Failed to generate certificate", err);
          return null;
      }
  }

  const getTestResult = async (attemptId: string): Promise<TestResultResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const attemptRef = doc(db, 'test_attempts', attemptId);
      const attemptSnap = await getDoc(attemptRef);
      if (!attemptSnap.exists() || attemptSnap.data().status !== 'completed') {
        throw new Error("Result not available or test not completed.");
      }
      
      const attemptData = attemptSnap.data();
      const totalQuestions = attemptData.total_questions || 0;
      const correctAnswers = totalQuestions > 0 ? Math.round(attemptData.score / 100 * totalQuestions) : 0;

      const result: TestResult = {
        attempt_id: attemptId,
        category_name_en: attemptData.categoryTitle,
        category_name_sw: '',
        score_percentage: attemptData.score,
        correct_answers: correctAnswers,
        wrong_answers: totalQuestions - correctAnswers,
        unanswered: totalQuestions - (attemptData.answers ? Object.keys(attemptData.answers).length : 0),
        total_questions: totalQuestions,
        pass_status: attemptData.passed ? 'Passed' : 'Failed',
        pass_mark: attemptData.passMark,
        duration_seconds: attemptData.endTime && attemptData.startTime ? (attemptData.endTime.toMillis() - attemptData.startTime.toMillis()) / 1000 : 0,
        completed_on: attemptData.endTime?.toDate().toISOString(),
        certificate_id: attemptData.certificate_id,
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
