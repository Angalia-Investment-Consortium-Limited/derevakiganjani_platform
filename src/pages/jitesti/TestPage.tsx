
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, where, documentId, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from '@/components/ui/progress';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";


// --- Type Definitions ---
type TestAttempt = {
    id: string;
    userId: string;
    categoryId?: string; // This is the linking ID, e.g., 'course-vip-test'
    testId?: string;     // Legacy field, might hold the jitesti-categories doc ID
    categoryTitle: string;
    startTime: { toDate: () => Date };
    durationInMinutes: number;
    passMark: number;
    status: 'started' | 'completed';
    score?: number;
    answers?: { [questionId: string]: number };
};

type Question = {
    id: string;
    text: string;
    options: string[];
    correctAnswerIndex: number;
};

type TestDoc = {
    id: string;
    questionIds: string[];
    courseId?: string;
};

// --- Data Fetching ---
const fetchTestAttempt = async (attemptId: string): Promise<TestAttempt | null> => {
    const docRef = doc(db, 'test_attempts', attemptId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as TestAttempt : null;
};

const fetchTestQuestions = async (lookupId: string | undefined): Promise<Question[]> => {
    console.log("Starting fetchTestQuestions with lookupId:", lookupId);
    if (!lookupId) {
        console.log("lookupId is undefined, returning empty array.");
        return [];
    }

    const testsRef = collection(db, 'tests');
    const categoriesRef = collection(db, 'jitesti-categories');
    let testQuerySnapshot;

    // --- Strategy 1: Assume lookupId is the correct courseId (new structure) ---
    console.log("Executing Strategy 1: Querying 'tests' where 'courseId' ==", lookupId);
    const s1_query = query(testsRef, where('courseId', '==', lookupId));
    testQuerySnapshot = await getDocs(s1_query);
    console.log("Strategy 1 result: empty?", testQuerySnapshot.empty);

    // --- Strategy 2: If S1 fails, assume lookupId is a jitesti-category doc ID (legacy structure) ---
    if (testQuerySnapshot.empty) {
        console.log("Strategy 1 failed. Executing Strategy 2: Looking up category directly.");
        try {
            const categoryDocRef = doc(db, 'jitesti-categories', lookupId);
            const categoryDocSnap = await getDoc(categoryDocRef);
            if (categoryDocSnap.exists()) {
                console.log("Strategy 2: Found category doc:", categoryDocSnap.id);
                const categoryData = categoryDocSnap.data();
                if (categoryData?.category_code) {
                    console.log("Strategy 2: Found category_code:", categoryData.category_code);
                    const s2_query = query(testsRef, where('courseId', '==', categoryData.category_code));
                    testQuerySnapshot = await getDocs(s2_query);
                    console.log("Strategy 2 result: empty?", testQuerySnapshot.empty);
                } else {
                    console.log("Strategy 2: Category doc found, but it has no 'category_code' field.");
                }
            } else {
                 console.log("Strategy 2: No category document found with ID:", lookupId);
            }
        } catch (e) {
            console.error("Strategy 2 failed with an error:", e);
        }
    }
    
    // --- Strategy 3: If S2 fails, assume lookupId is the test TITLE (very old legacy) ---
    if (testQuerySnapshot.empty) {
        console.log("Strategy 2 failed. Executing Strategy 3: Looking up category by name_en.");
        const s3_categoryQuery = query(categoriesRef, where('name_en', '==', lookupId));
        const s3_categorySnapshot = await getDocs(s3_categoryQuery);
        console.log("Strategy 3 category query result: empty?", s3_categorySnapshot.empty);

        if (!s3_categorySnapshot.empty) {
            const categoryData = s3_categorySnapshot.docs[0].data();
            console.log("Strategy 3: Found category by name_en:", categoryData);
            if (categoryData?.category_code) {
                console.log("Strategy 3: Found category_code:", categoryData.category_code);
                const s3_testQuery = query(testsRef, where('courseId', '==', categoryData.category_code));
                testQuerySnapshot = await getDocs(s3_testQuery);
                console.log("Strategy 3 result: empty?", testQuerySnapshot.empty);
            } else {
                 console.log("Strategy 3: Category doc found, but it has no 'category_code' field.");
            }
        }
    }

    if (!testQuerySnapshot || testQuerySnapshot.empty) {
        console.error("All strategies failed. Test definition not found.");
        throw new Error("Test definition not found.");
    }

    const testDocSnap = testQuerySnapshot.docs[0];
    console.log("Found test document:", testDocSnap.id, testDocSnap.data());
    const { questionIds } = testDocSnap.data() as TestDoc;

    if (!questionIds || questionIds.length === 0) {
        console.warn("Test document found, but it has no questionIds.");
        return [];
    }
    
    console.log("Found questionIds:", questionIds);

    const questionsRef = collection(db, 'Test Question');
    const questionsQuery = query(questionsRef, where(documentId(), 'in', questionIds));
    const questionsSnapshot = await getDocs(questionsQuery);
    
    console.log("Queried 'Test Question' collection. Found docs:", questionsSnapshot.size);
    
    const questionsMap = new Map<string, Question>();
    questionsSnapshot.forEach(doc => {
        const data = doc.data();

        const firestoreOptions = data.options || {};
        const sortedEntries = Object.entries(firestoreOptions)
            .sort(([keyA], [keyB]) => parseInt(keyA) - parseInt(keyB));

        const sortedOptions = sortedEntries
            .map(([, optionValue]: [string, any]) => optionValue.optionTextSw || optionValue.optionTextEn || '');

        let correctIndex = -1;
        if (data.correctAnswer) { // e.g. "A"
            const correctKey = data.correctAnswer;
            const correctEntry = sortedEntries.find(([, optionValue]: [string, any]) => optionValue.optionKey === correctKey);
            if (correctEntry) {
                correctIndex = sortedEntries.indexOf(correctEntry);
            }
        } else if (typeof data.correct_option_index !== 'undefined') {
            correctIndex = data.correct_option_index;
        }

        const question: Question = {
            id: doc.id,
            text: data.question_text_sw || data.questionTextSw || data.questionTextEn || data.text || "Question text is missing.",
            options: sortedOptions,
            correctAnswerIndex: correctIndex,
        };
        questionsMap.set(doc.id, question);
    });

    const finalQuestions = questionIds.map(id => questionsMap.get(id)).filter((q): q is Question => !!q);
    console.log("Final mapped questions:", finalQuestions);
    return finalQuestions;
};

// --- Helper to format time ---
const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// --- TestPage Component ---
const TestPage: React.FC = () => {
    const { testAttemptId = '' } = useParams<{ testAttemptId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // --- Queries ---
    const { data: testAttempt, isLoading: isLoadingAttempt, error: attemptError } = useQuery<TestAttempt | null>({
        queryKey: ['test-attempt', testAttemptId],
        queryFn: () => fetchTestAttempt(testAttemptId),
    });

    const testLookupId = testAttempt?.categoryId || testAttempt?.testId || testAttempt?.categoryTitle;

    const { data: questions = [], isLoading: isLoadingQuestions, error: questionsError } = useQuery<Question[]>({
        queryKey: ['test-questions', testLookupId],
        queryFn: () => fetchTestQuestions(testLookupId),
        enabled: !!testLookupId, 
    });

    // --- Timer Logic ---
    useEffect(() => {
        if (!testAttempt || testAttempt.status === 'completed' || !testAttempt.startTime) return;

        const endTime = testAttempt.startTime.toDate().getTime() + testAttempt.durationInMinutes * 60 * 1000;
        
        const updateTimer = () => {
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0) {
                submitTestMutation.mutate();
            }
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);
    }, [testAttempt]);

    // --- Mutation for Submission ---
    const submitTestMutation = useMutation({
        mutationFn: async () => {
            if (!testAttempt || !questions) throw new Error("Missing test data for submission.");

            let score = 0;
            questions.forEach(q => {
                if (answers[q.id] === q.correctAnswerIndex) {
                    score++;
                }
            });

            const attemptRef = doc(db, 'test_attempts', testAttemptId);
            await updateDoc(attemptRef, {
                status: 'completed',
                score: score,
                answers: answers,
                endTime: serverTimestamp(),
            });

            return { score, total: questions.length };
        },
        onSuccess: () => {
            toast({ title: "Test Submitted!", description: "Your results have been calculated." });
            queryClient.invalidateQueries({ queryKey: ['test-attempt', testAttemptId]});
        },
        onError: (error) => {
             toast({ title: "Submission Error", description: error.message, variant: "destructive" });
        }
    });

    // --- Event Handlers ---
    const handleAnswerChange = (questionId: string, optionIndex: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleNext = () => setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length - 1));
    const handlePrevious = () => setCurrentQuestionIndex(prev => Math.max(0, prev - 1));

    // --- Derived State ---
    const currentQuestion = useMemo(() => questions?.[currentQuestionIndex], [questions, currentQuestionIndex]);
    const progress = useMemo(() => (questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0), [currentQuestionIndex, questions.length]);

    // --- Render Logic ---
    if (isLoadingAttempt) return <div className="container mx-auto p-4">Loading your test...</div>;
    if (attemptError || !testAttempt) return <div className="container mx-auto p-4 text-red-500">Error loading the test. It might be invalid or expired.</div>;
    if (!user || user.uid !== testAttempt.userId) return <div className="container mx-auto p-4 text-red-500">You are not authorized to take this.</div>;
    
    // -- View: Test Completed --
    if (testAttempt.status === 'completed') {
        const scorePercent = questions.length > 0 ? ((testAttempt.score || 0) / questions.length) * 100 : 0;
        const passed = testAttempt.passMark ? scorePercent >= testAttempt.passMark : false;
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header/>
                <Breadcrumb className="mb-6">
                          <BreadcrumbList>
                            <BreadcrumbItem>
                              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbPage>Jitesti-Test Categories</BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbPage>Jitesti-Quiz Completion</BreadcrumbPage>
                            </BreadcrumbItem>
                          </BreadcrumbList>
                        </Breadcrumb>
            <div className="container mx-auto py-10 flex items-center justify-center">
                <Card className="w-full max-w-2xl text-center">
                    <CardHeader>
                        <CardTitle>Test Results: {testAttempt.categoryTitle}</CardTitle>
                        <CardDescription>You have completed the test.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className={`text-5xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                            {passed ? 'Passed' : 'Failed'}
                        </p>
                        <p className="text-2xl">Your Score: <strong>{testAttempt.score} out of {questions.length}</strong> ({scorePercent.toFixed(1)}%)</p>
                        <p className="text-muted-foreground">The required pass mark was {testAttempt.passMark}%.</p>
                    </CardContent>
                    <CardFooter>
                         <Button onClick={() => navigate('/jitesti')} className="w-full">Back to Jitesti Home</Button>
                    </CardFooter>
                </Card>
            </div>
            < Footer />
            </div>
        );
    }

    // -- View: Active Test --
    return (
        <div className="min-h-screen flex flex-col bg-background">
         <Header />
         <Breadcrumb className="mb-6">
                          <BreadcrumbList>
                            <BreadcrumbItem>
                              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbPage>Jitesti-Test Categories</BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbPage>Jitesti-Quiz Completion</BreadcrumbPage>
                            </BreadcrumbItem>
                          </BreadcrumbList>
                        </Breadcrumb>
         <main className="flex-grow container mx-auto px-4 py-8">
        <div className="container mx-auto py-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                           <CardTitle>{testAttempt.categoryTitle}</CardTitle>
                           <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
                        </div>
                        <div className="text-lg font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-md">
                            {timeLeft !== null ? formatTime(timeLeft) : "Loading..."}
                        </div>
                    </div>
                    <Progress value={progress} className="mt-4" />
                </CardHeader>

                <CardContent className="min-h-[300px]">
                     {isLoadingQuestions ? (
                        <p>Loading questions...</p>
                    ) : questionsError ? (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{questionsError.message}</AlertDescription>
                        </Alert>
                    ) : currentQuestion ? (
                        <div>
                            <p className="text-xl font-semibold mb-6">{currentQuestion.text}</p>
                            <RadioGroup 
                                value={answers[currentQuestion.id]?.toString()} 
                                onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
                            >
                                {currentQuestion.options.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-3 p-3 border rounded-md has-[:checked]:bg-muted has-[:checked]:border-primary">
                                        <RadioGroupItem value={index.toString()} id={`q${currentQuestion.id}-opt${index}`} />
                                        <Label htmlFor={`q${currentQuestion.id}-opt${index}`} className="flex-1 cursor-pointer">{option}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    ) : (
                         <p>There are no questions available for this test.</p>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>Previous</Button>
                    {currentQuestionIndex === questions.length - 1 ? (
                        <Button onClick={() => submitTestMutation.mutate()} disabled={submitTestMutation.isPending || questions.length === 0} className="bg-green-600 hover:bg-green-700">
                           {submitTestMutation.isPending ? 'Submitting...' : 'Finish & Submit'}
                        </Button>
                    ) : (
                        <Button onClick={handleNext} disabled={questions.length === 0}>Next</Button>
                    )}
                </CardFooter>
            </Card>
        </div>
        </main>
        <Footer />
        </div>
    );
}

export default TestPage;
